import { useEffect, useState } from "react";
import { useFileStore } from "../../store/fileStore";
import { useNodeDataStore } from "../../store/nodeDataStore";

interface CsvSummary {
  rowCount: number;
  columnCount: number;
  headers: string[];
  preview: string[][];
}

export default function CsvWindow({ id }: { id: string }) {
  const { files, getFile } = useFileStore();
  const { setNodeData, data } = useNodeDataStore();

  const csvInputs = files
    .filter((f) => f.isInput)
    .filter((f) => f.file.name.toLowerCase().endsWith(".csv"));

  const [currentFileKey, setCurrentFileKey] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [csvSummary, setCsvSummary] = useState<CsvSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fileKey = data[id]?.fileKey || "";
    setCurrentFileKey(fileKey);

    if (fileKey) {
      const file = files.find((f) => f.file.key === fileKey)?.file;
      setFileName(file?.name || "");
      loadCsvSummary(fileKey);
    } else {
      setFileName("");
      setCsvSummary(null);
    }
  }, [data, id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fileKey = e.target.value;
    setCurrentFileKey(fileKey);

    const file = files.find((f) => f.file.key === fileKey)?.file;
    setFileName(file?.name || "");

    setNodeData(id, { fileKey });
    loadCsvSummary(fileKey);
  };

  const loadCsvSummary = async (fileKey: string) => {
    if (!fileKey) {
      setCsvSummary(null);
      return;
    }

    setIsLoading(true);

    try {
      const file = getFile(fileKey);
      if (!file || !file.raw) {
        setCsvSummary(null);
        return;
      }

      // If we have cached content, use it
      if (file.contentText) {
        processCsvContent(file.contentText);
        return;
      }

      // Otherwise read the file
      const text = await file.raw.text();
      processCsvContent(text);
    } catch (error) {
      console.error("Error loading CSV:", error);
      setCsvSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const processCsvContent = (csvContent: string) => {
    try {
      // TODO : Implement a robust CSV parser
      // Simple CSV parsing (can be replaced with a more robust parser if needed)
      const lines = csvContent.split(/\r\n|\n/).filter((line) => line.trim());

      if (lines.length === 0) {
        setCsvSummary(null);
        return;
      }

      // Parse headers (first line)
      const headers = lines[0].split(",").map((header) => header.trim());

      // Parse a preview of data rows (up to 5)
      const previewRows = lines
        .slice(1, 6)
        .map((line) => line.split(",").map((cell) => cell.trim()));

      setCsvSummary({
        rowCount: lines.length - 1, // Excluding header
        columnCount: headers.length,
        headers,
        preview: previewRows,
      });
    } catch (error) {
      console.error("Error parsing CSV:", error);
      setCsvSummary(null);
    }
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {csvSummary.headers.map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-600 bg-gray-700 p-1 text-left"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvSummary.preview.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={
                        rowIndex % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                      }
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-700 p-1 max-w-[150px] truncate"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
