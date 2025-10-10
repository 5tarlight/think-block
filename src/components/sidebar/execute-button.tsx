import cn from "@yeahx4/cn";
import {
  useEdgeState,
  useNodeState,
  type Node,
  type Port,
} from "../../store/graphics";
import { buildLayers } from "../../lib/execution/execution";
import { useNodeDataStore } from "../../store/nodeDataStore";
import { useState } from "react";

export default function ExecuteButton() {
  const { nodes } = useNodeState();
  const { edges } = useEdgeState();
  const { getNodeData, setNodeData } = useNodeDataStore();
  const [progress, setProgress] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  const getInputs = (
    nodeMap: Map<string, Node>,
    nodeId: string
  ): Record<string, any> => {
    const inputEdges = edges.filter((e) => e.to.node === nodeId);
    const inputs: Record<string, any> = {};

    for (const e of inputEdges) {
      const fromNode = nodeMap.get(e.from.node);
      const toNode = nodeMap.get(e.to.node);

      const fromPort: Port | undefined = fromNode?.outputs?.find(
        (p: any) => p.id === e.from.port
      );
      const toPort: Port | undefined = toNode?.inputs?.find(
        (p: any) => p.id === e.to.port
      );

      const fromKey = fromPort?.name;
      const toKey = toPort?.name;

      const fromData = getNodeData(e.from.node);

      let value: any = undefined;

      if (fromData) {
        if (fromKey! in fromData) {
          value = fromData[fromKey!];
        } else if (e.from.port in fromData) {
          value = fromData[e.from.port];
        } else {
          const keys = Object.keys(fromData);
          if (keys.length === 1) value = fromData[keys[0]];
          else value = undefined;
        }
      }

      inputs[toKey!] = value;
    }

    return inputs;
  };

  const onExecute = async () => {
    const layers = buildLayers(nodes, edges);
    console.log("Execution layers:", layers);

    let done = 0;
    setProgress(0);
    setIsExecuting(true);
    const totalNodes = nodes.length;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    for (const layer of layers) {
      await Promise.all(
        layer.map(async (nodeId) => {
          const node = nodeMap.get(nodeId);
          if (!node?.impl?.process) return;

          const inputs = getInputs(nodeMap, nodeId);
          const outputs = await node.impl.process(inputs);
          setNodeData(nodeId, outputs);

          // Delay 1s to visualize progress
          await new Promise((r) => setTimeout(r, 1000));

          done += 1;
          setProgress(done / totalNodes);
        })
      );
    }

    setIsExecuting(false);
    console.log("Execution complete");
  };

  return (
    <button
      className={cn(
        "w-full p-2 bg-blue-500 rounded-sm transition-colors",
        "hover:bg-blue-400 cursor-pointer",
        (isExecuting && "hover:cursor-progress opacity-70") || ""
      )}
      onClick={isExecuting ? undefined : onExecute}
    >
      {isExecuting
        ? `Executing... (${Math.round(progress * 100)}%)`
        : "Execute"}
    </button>
  );
}
