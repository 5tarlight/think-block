import { useEffect, useState } from "react";
import { useFileStore } from "../../store/fileStore";
import { useNodeDataState } from "../../store/nodeDataStore";
import CSV from "../../lib/data/csv";
import CSVViewer from "../window/csv-viewer";

interface CsvSummary {
  rowCount: number;
  columnCount: number;
  headers: string[];
  preview: string[][];
}

export default function CsvWindow({ id }: { id: string }) {
  const { files, getFile } = useFileStore();
  const { setNodeData, getNodeData } = useNodeDataState();
  const data = getNodeData(id) || {};

  const csvInputs = files
    .filter((f) => f.isInput)
    .filter((f) => f.file.name.toLowerCase().endsWith(".csv"));

  const [currentFileKey, setCurrentFileKey] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [csvSummary, setCsvSummary] = useState<CsvSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const fileKey = data.fileKey || "";
      setCurrentFileKey(fileKey);

      if (fileKey) {
        const file = files.find((f) => f.file.key === fileKey)?.file;
        setFileName(file?.name || "");
        await loadCsvSummary(fileKey);
      } else {
        setFileName("");
        setCsvSummary(null);
      }
    })();
  }, [data, id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fileKey = e.target.value;
    setCurrentFileKey(fileKey);

    const file = files.find((f) => f.file.key === fileKey)?.file;
    setFileName(file?.name || "");

    // setNodeData(id, { fileKey });
    await loadCsvSummary(fileKey);
  };

  const loadCsvSummary = async (fileKey: string) => {
    if (!fileKey) {
      setCsvSummary(null);
      return;
    }

    setIsLoading(true);

    if (data.fileKey === fileKey && data.csv) {
      setCsvSummary({
        rowCount: data.csv.getRows(),
        columnCount: data.csv.getColumns(),
        headers: data.csv.headers,
        preview: data.csv.rows.slice(0, 5),
      });
      setIsLoading(false);
      return;
    }

    try {
      const file = getFile(fileKey);
      if (!file || !file.raw) {
        setCsvSummary(null);
        return;
      }

      // If we have cached content, use it
      if (file.contentText) {
        await processCsvContent(fileKey, file.contentText);
        return;
      }

      // Otherwise read the file
      const text = await file.raw.text();
      await processCsvContent(fileKey, text);
    } catch (error) {
      console.error("Error loading CSV:", error);
      setCsvSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const processCsvContent = async (fileKey: string, csvContent: string) => {
    const csv = await CSV.fromString(csvContent, true);
    setCsvSummary({
      rowCount: csv.getRows(),
      columnCount: csv.getColumns(),
      headers: csv.headers,
      preview: csv.rows.slice(0, 5),
    });

    setNodeData(id, { fileKey, csv });
  };

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">CSV File: </label>
        <select
          value={currentFileKey}
          onChange={handleFileChange}
          className="bg-gray-700 text-white p-1 rounded border border-gray-600 flex-1 text-sm"
        >
          <option value="">-- Select a CSV file --</option>
          {csvInputs.map((f) => (
            <option key={f.file.key} value={f.file.key}>
              {f.file.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-full text-gray-400">
          Loading CSV data...
        </div>
      )}

      {!isLoading && !currentFileKey && (
        <div className="flex items-center justify-center h-full text-gray-400">
          No CSV file selected
        </div>
      )}

      {!isLoading && currentFileKey && !csvSummary && (
        <div className="flex items-center justify-center h-full text-red-400">
          Failed to load CSV data
        </div>
      )}

      {!isLoading && csvSummary && (
        <div className="flex flex-col gap-3 overflow-hidden h-full">
          <div className="flex gap-4 text-sm">
            <div className="bg-gray-700 p-2 rounded flex-1">
              <strong>File:</strong> {fileName}
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <strong>Rows:</strong> {csvSummary.rowCount.toLocaleString()}
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <strong>Columns:</strong> {csvSummary.columnCount}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <h4 className="text-sm font-semibold mb-2">Preview:</h4>
            <CSVViewer csv={getNodeData(id)?.csv} maxColumns={20} maxRows={5} />
          </div>
        </div>
      )}
    </div>
  );
}
