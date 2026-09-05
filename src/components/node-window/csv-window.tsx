import { useState } from "react";
import CSV from "../../lib/data/csv";
import { useFileStore } from "../../store/fileStore";
import { useNodeDataState } from "../../store/nodeDataStore";
import CSVViewer from "../window/csv-viewer";

export default function CsvWindow({ id }: { id: string }) {
  const { files, getFile } = useFileStore();
  const { setNodeData, getNodeData } = useNodeDataState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const data = getNodeData(id) ?? {};
  const currentFileKey = typeof data.fileKey === "string" ? data.fileKey : "";
  const csv = data.csv instanceof CSV ? data.csv : null;
  const csvInputs = files.filter(
    (entry) =>
      entry.isInput && entry.file.name.toLowerCase().endsWith(".csv")
  );
  const fileName =
    files.find((entry) => entry.file.key === currentFileKey)?.file.name ?? "";

  const loadCsv = async (fileKey: string) => {
    setError(null);
    if (!fileKey) {
      setNodeData(id, { fileKey: "", csv: null });
      return;
    }

    setIsLoading(true);
    setNodeData(id, { fileKey, csv: null });
    try {
      const file = getFile(fileKey);
      if (!file) throw new Error("선택한 파일을 찾을 수 없습니다.");
      const text = file.contentText ?? (await file.raw.text());
      const parsed = await CSV.fromString(text, true);
      if (parsed.getRows() === 0 || parsed.getColumns() === 0) {
        throw new Error("CSV에 읽을 수 있는 행과 열이 없습니다.");
      }
      setNodeData(id, { fileKey, csv: parsed });
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "CSV를 읽지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="csv-config">
      <div className="csv-config__picker">
        <label htmlFor={`csv-file-${id}`}>CSV 파일</label>
        <select
          id={`csv-file-${id}`}
          value={currentFileKey}
          onChange={(event) => void loadCsv(event.target.value)}
        >
          <option value="">파일을 선택하세요</option>
          {csvInputs.map((entry) => (
            <option key={entry.file.key} value={entry.file.key}>
              {entry.file.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <div className="window-message">CSV를 읽고 있어요…</div>}
      {!isLoading && !currentFileKey && (
        <div className="window-message">
          왼쪽 파일 탭에서 CSV를 업로드한 뒤 여기서 선택하세요.
        </div>
      )}
      {!isLoading && error && (
        <div className="window-message window-message--error">{error}</div>
      )}
      {!isLoading && csv && (
        <div className="csv-config__preview">
          <div className="csv-config__summary">
            <strong>{fileName}</strong>
            <span>{csv.getRows().toLocaleString()}행</span>
            <span>{csv.getColumns()}열</span>
          </div>
          <CSVViewer csv={csv} maxColumns={20} maxRows={5} />
        </div>
      )}
    </div>
  );
}
