import type { Edge, Node, Port } from "../../store/graphics";
import { useNodeState } from "../../store/graphics";
import { useNodeDataState } from "../../store/nodeDataStore";
import { useExecutionStore } from "../../store/executionStore";
import { buildLayers } from "./execution";

function getInputs(
  nodeMap: Map<string, Node>,
  edges: Edge[],
  nodeId: string
): Record<string, unknown> {
  const inputEdges = edges.filter((edge) => edge.to.node === nodeId);
  const inputs: Record<string, unknown> = {};
  const { getNodeData } = useNodeDataState.getState();

  for (const edge of inputEdges) {
    const fromNode = nodeMap.get(edge.from.node);
    const toNode = nodeMap.get(edge.to.node);
    const fromPort: Port | undefined = fromNode?.outputs.find(
      (port) => port.id === edge.from.port
    );
    const toPort: Port | undefined = toNode?.inputs.find(
      (port) => port.id === edge.to.port
    );
    if (!fromPort || !toPort) continue;

    const fromData = getNodeData(edge.from.node);
    let value = fromData?.[fromPort.name];
    if (value === undefined) value = fromData?.[edge.from.port];
    if (value === undefined && fromData) {
      const values = Object.values(fromData);
      if (values.length === 1) value = values[0];
    }
    inputs[toPort.name] = value;
  }

  return inputs;
}

export async function runGraph(nodes: Node[], edges: Edge[]): Promise<boolean> {
  const execution = useExecutionStore.getState();
  const { setNodeData } = useNodeDataState.getState();
  const { setErrorNode } = useNodeState.getState();
  const startTime = performance.now();

  execution.start(nodes.map((node) => node.id));
  setErrorNode(null);

  try {
    if (nodes.length === 0) {
      throw new Error("실행할 블록이 없습니다. 왼쪽 라이브러리에서 블록을 추가하세요.");
    }

    const layers = buildLayers(nodes, edges);
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    let completed = 0;

    for (const layer of layers) {
      await Promise.all(
        layer.map(async (nodeId) => {
          const node = nodeMap.get(nodeId);
          if (!node?.impl) return;

          useExecutionStore.getState().setNodeStatus(nodeId, "running");
          try {
            const outputs = await node.impl.process(
              getInputs(nodeMap, edges, nodeId)
            );
            setNodeData(nodeId, outputs);
            useExecutionStore.getState().setNodeStatus(nodeId, "success");
            completed += 1;
            useExecutionStore.getState().setProgress(completed / nodes.length);
          } catch (error) {
            useExecutionStore.getState().setNodeStatus(nodeId, "error");
            setErrorNode(nodeId);
            const reason = error instanceof Error ? error.message : "알 수 없는 오류";
            throw new Error(`${node.title}: ${reason}`);
          }
        })
      );
    }

    useExecutionStore.getState().succeed(performance.now() - startTime);
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "그래프 실행에 실패했습니다.";
    useExecutionStore.getState().fail(message, performance.now() - startTime);
    return false;
  }
}
