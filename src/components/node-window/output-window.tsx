import cn from "@yeahx4/cn";
import CSV from "../../lib/data/csv";
import { useNodeDataState } from "../../store/nodeDataStore";
import CSVViewer from "../window/csv-viewer";

export default function OutputWindow({ nodeId }: { nodeId: string }) {
  const { getNodeData } = useNodeDataState();
  const possibleData = getNodeData(nodeId);
  const data = possibleData ? possibleData["data"] : null;
  const empty = !data;

  if (empty) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center h-full",
          "text-gray-400 space-y-2 text-center"
        )}
      >
        <span>No output data available.</span>
        <span>Please run to generate output.</span>
        <span>Or check the connection to the data source.</span>
      </div>
    );
  }

  const isCsv = data instanceof CSV;
  const isValue =
    typeof data === "number" ||
    typeof data === "string" ||
    typeof data === "boolean";

  return (
    <div>
      {isCsv && <CSVViewer csv={data} maxRows={10} maxColumns={20} />}
      {isValue && <div>{String(data)}</div>}
    </div>
  );
}
