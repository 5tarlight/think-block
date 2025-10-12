import { useNodeDataState } from "../../store/nodeDataStore";

export default function OutputWindow({ nodeId }: { nodeId: string }) {
  const { getNodeData } = useNodeDataState();
  const possibleData = getNodeData(nodeId);
  const data = possibleData ? possibleData["data"] : null;

  return (
    <div>
      {data ? JSON.stringify(data) : "No data yet. Please run the node."}
    </div>
  );
}
