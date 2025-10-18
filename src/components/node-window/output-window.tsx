import cn from "@yeahx4/cn";
import CSV from "../../lib/data/csv";
import { useNodeDataState } from "../../store/nodeDataStore";
import CSVViewer from "../window/csv-viewer";
import { Tensor } from "@tensorflow/tfjs";
import { useEffect, useState } from "react";

export default function OutputWindow({ nodeId }: { nodeId: string }) {
  const { getNodeData } = useNodeDataState();
  const possibleData = getNodeData(nodeId);
  const data = possibleData ? possibleData["data"] : null;
  const empty = data === null || data === undefined;

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

  const isCsv = data instanceof CSV || data instanceof Tensor;
  const isValue =
    typeof data === "number" ||
    typeof data === "string" ||
    typeof data === "boolean";

  const [csvData, setCsvData] = useState<CSV | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (isCsv) {
      if (data instanceof CSV) {
        setCsvData(data);
      } else {
        const result = CSV.fromTensor(data);
        if (result instanceof Promise) {
          result.then((csv) => {
            if (isMounted) setCsvData(csv);
          });
        } else {
          setCsvData(result);
        }
      }
    } else {
      setCsvData(null);
    }
    return () => {
      isMounted = false;
    };
  }, [data, isCsv]);

  return (
    <div>
      {isCsv && csvData && (
        <CSVViewer csv={csvData} maxRows={10} maxColumns={20} />
      )}

      {isValue && <div>{String(data)}</div>}
    </div>
  );
}
