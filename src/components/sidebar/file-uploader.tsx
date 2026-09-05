import { useRef, useState } from "react";
import cn from "@yeahx4/cn";
import FileItem from "./file-item";
import { useFileStore, type FileDesc } from "../../store/fileStore";

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { files, upsertFile, removeFile, insertFiles } = useFileStore();

  const readFileWithProgress = (f: FileDesc) => {
    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      upsertFile({ ...f, status: "reading", progress: pct });
    };

    reader.onerror = () => {
      upsertFile({ ...f, status: "error", progress: 100 });
    };

    reader.onload = () => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      const result = reader.result as string | ArrayBuffer | null;

      if (
        typeof result === "string" ||
        ["csv", "txt", "json", "md", "log"].includes(ext)
      ) {
        upsertFile({
          ...f,
          status: "done",
          progress: 100,
          contentText: typeof result === "string" ? result : undefined,
        });
      } else if (f.raw.type.startsWith("image/")) {
        const url = URL.createObjectURL(f.raw);
        upsertFile({ ...f, status: "done", progress: 100, previewURL: url });
      } else {
        upsertFile({ ...f, status: "done", progress: 100 });
      }
    };

    if (f.raw.type.startsWith("text/")) {
      reader.readAsText(f.raw);
    } else {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      if (["csv", "txt", "json", "md", "log"].includes(ext)) {
        reader.readAsText(f.raw);
      } else {
        reader.readAsArrayBuffer(f.raw);
      }
    }
  };

  const addFiles = (picked: FileList | File[]) => {
    const items = insertFiles(picked);
    items.forEach(readFileWithProgress);
  };

  const openPicker = () => inputRef.current?.click();

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  // --- DnD ---
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      setIsDragging(false);
      dragCounter.current = 0;
    }
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div className="file-uploader">
      <div className="flex justify-between items-center">
        <span className="text-sm">실습 파일</span>
        <button
          className="text-sm text-blue-500 hover:underline cursor-pointer"
          onClick={openPicker}
          type="button"
        >
          업로드
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handlePick}
          // accept=".csv,.json,.png,.jpg,.jpeg,.txt"
        />
      </div>

      <div
        className={cn(
          "relative flex flex-col border p-1 rounded-sm gap-1",
          "min-h-32 max-h-64 overflow-y-auto overflow-x-hidden",
          isDragging
            ? "border-blue-500/70 border-dashed ring-1 ring-blue-500/40"
            : "border-neutral-700"
        )}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        aria-label="Drop files here"
      >
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-sm bg-white/5">
            <div className="text-sm font-medium">여기에 놓아 업로드</div>
          </div>
        )}

        {files.length > 0 ? (
          files
            .filter((f) => f.isInput)
            .map((f) => f.file)
            .map((f) => (
              <FileItem
                key={f.key}
                name={f.name}
                size={f.size}
                progress={f.progress}
                status={f.status}
                removeFile={removeFile}
                file={f}
              />
            ))
        ) : (
          <div className="text-white/50 italic text-sm text-center py-6">
            CSV 파일을 끌어 놓거나 업로드를 누르세요.
          </div>
        )}
      </div>
    </div>
  );
}
