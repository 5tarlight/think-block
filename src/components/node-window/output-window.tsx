import CSV from "../../lib/data/csv";
import { useNodeDataState } from "../../store/nodeDataStore";

export default function OutputWindow({ nodeId }: { nodeId: string }) {
  const { getNodeData } = useNodeDataState();
  const possibleData = getNodeData(nodeId);
  const data = possibleData ? possibleData["data"] : null;

  const isCsv = data instanceof CSV;
  const isValue =
    typeof data === "number" ||
    typeof data === "string" ||
    typeof data === "boolean";

  return (
    <div>
      {isCsv && <div>TODO : CSV Viewer</div>}
      {isValue && <div>{String(data)}</div>}
    </div>
  );
}
