import cn from "@yeahx4/cn";
import {
  useEdgeState,
  useNodeState,
  type Node,
  type Port,
} from "../../store/graphics";
import { buildLayers } from "../../lib/execution/execution";
import { useNodeDataStore } from "../../store/nodeDataStore";

export default function ExecuteButton() {
  const { nodes } = useNodeState();
  const { edges } = useEdgeState();
  const { getNodeData, setNodeData } = useNodeDataStore();

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

      // 포트의 '값 키'를 찾는 우선순위(커스터마이즈 가능)
      const fromKey = fromPort?.name;
      const toKey = toPort?.name;

      const fromData = getNodeData(e.from.node);
      console.log(`from node ${e.from.node} data:`, fromData, {
        fromPort,
        fromKey,
        toPort,
        toKey,
      });

      let value: any = undefined;

      if (fromData) {
        // 1) 포트 이름으로 직접 찾기
        if (fromKey! in fromData) {
          value = fromData[fromKey!];
        }
        // 2) 혹시 fromData가 포트 id로 되어있다면 (fallback)
        else if (e.from.port in fromData) {
          value = fromData[e.from.port];
        }
        // 3) fromData가 단일 값 객체인 경우 (예: { value: 123 } 혹은 { someKey: val } 하나뿐)
        else {
          const keys = Object.keys(fromData);
          if (keys.length === 1) value = fromData[keys[0]];
          else value = undefined; // 여러 키인데 매칭되는게 없다면 undefined
        }
      }

      // toKey 자리에 value 할당 (존재하지 않더라도 명시적으로 undefined를 넣어둠)
      inputs[toKey!] = value;
    }

    return inputs;
  };

  const onExecute = async () => {
    const layers = buildLayers(nodes, edges);
    console.log("Execution layers:", layers);

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    for (const layer of layers) {
      await Promise.all(
        layer.map(async (nodeId) => {
          const node = nodeMap.get(nodeId);
          if (!node?.impl?.process) return;

          const inputs = getInputs(nodeMap, nodeId);
          console.log(inputs);
          const outputs = await node.impl.process(inputs);
          setNodeData(nodeId, outputs);
        })
      );
    }

    console.log("Execution complete");
  };

  return (
    <button
      className={cn(
        "w-full p-2 bg-blue-500 rounded-sm transition-colors",
        "hover:bg-blue-400 cursor-pointer"
      )}
      onClick={onExecute}
    >
      Execute
    </button>
  );
}
