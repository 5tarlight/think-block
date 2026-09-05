import { getNodeImpl, nodeCatalog, type NodeType } from "./node";
import type { Edge, Node, Port } from "../store/graphics";

export interface SerializedProject {
  version: 1;
  name: string;
  savedAt: string;
  nodes: Array<{
    id: string;
    type: NodeType;
    title: string;
    pos: { x: number; y: number };
    size: Node["size"];
    inputs: Port[];
    outputs: Port[];
  }>;
  edges: Edge[];
  settings: Record<string, Record<string, string | number | boolean | null>>;
}

export function serializeProject(
  name: string,
  nodes: Node[],
  edges: Edge[],
  nodeData: Record<string, Record<string, unknown>>
): SerializedProject {
  const numberNodeIds = new Set(
    nodes.filter((node) => node.type === "number").map((node) => node.id)
  );
  const settings = Object.fromEntries(
    Object.entries(nodeData)
      .filter(([nodeId]) => numberNodeIds.has(nodeId))
      .map(([nodeId, data]) => [
        nodeId,
        typeof data.value === "number" ? { value: data.value } : {},
      ])
      .filter(([, data]) => Object.keys(data).length > 0)
  ) as SerializedProject["settings"];

  return {
    version: 1,
    name,
    savedAt: new Date().toISOString(),
    nodes: nodes.map(({ id, type, title, pos, size, inputs, outputs }) => ({
      id,
      type,
      title,
      pos,
      size,
      inputs,
      outputs,
    })),
    edges,
    settings,
  };
}

export function restoreProject(project: SerializedProject): {
  name: string;
  nodes: Node[];
  edges: Edge[];
  settings: SerializedProject["settings"];
} {
  if (project.version !== 1 || !Array.isArray(project.nodes) || !Array.isArray(project.edges)) {
    throw new Error("지원하지 않는 Think Block 프로젝트 파일입니다.");
  }

  const validTypes = new Set(nodeCatalog.map((item) => item.type));
  const nodes = project.nodes.map((saved) => {
    if (!validTypes.has(saved.type)) {
      throw new Error(`알 수 없는 블록 종류입니다: ${saved.type}`);
    }
    const impl = getNodeImpl(saved.id, saved.type);
    if (impl) {
      impl.inputs = saved.inputs;
      impl.outputs = saved.outputs;
      impl.size = saved.size;
    }
    return { ...saved, impl };
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const edges = project.edges.filter(
    (edge) =>
      nodeIds.has(edge.from.node) &&
      nodeIds.has(edge.to.node) &&
      nodeMap
        .get(edge.from.node)
        ?.outputs.some((port) => port.id === edge.from.port) &&
      nodeMap.get(edge.to.node)?.inputs.some((port) => port.id === edge.to.port)
  );

  return {
    name: project.name || "이름 없는 실험",
    nodes,
    edges,
    settings: project.settings ?? {},
  };
}
