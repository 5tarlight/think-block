import { useRef, useState } from "react";
import cn from "@yeahx4/cn";
import FileItem from "./file-item";

type UIFile = { name: string; size: number; key: string };

export default function FileUploader() {
  const [files, setFiles] = useState<UIFile[]>([
    { name: "data.csv", size: 123, key: "seed-data.csv" },
    { name: "image.png", size: 456, key: "seed-image.png" },
    { name: "document.txt", size: 789, key: "seed-document.txt" },
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const toKB = (bytes: number) => Math.max(1, Math.round(bytes / 1024));

  const addFiles = (picked: FileList | File[]) => {
    const arr = Array.from(picked);
    if (arr.length === 0) return;

    const next: UIFile[] = arr.map((f) => ({
      name: f.name,
      size: toKB(f.size),
      key: `${f.name}-${f.lastModified}-${f.size}`,
    }));

    setFiles((prev) => {
      const merged = [...prev, ...next];
      const uniq = new Map<string, UIFile>();
      for (const it of merged) if (!uniq.has(it.key)) uniq.set(it.key, it);
      return Array.from(uniq.values());
    });
  };

  const openPicker = () => inputRef.current?.click();

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    // Allow re-selecting the same file
    e.target.value = "";
  };

  // --- Drag & Drop handlers ---
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent browser from opening file
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
    if (e.dataTransfer?.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col mt-16 gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm">Files</span>
        <button
          className="text-sm text-blue-500 hover:underline"
          onClick={openPicker}
          type="button"
        >
          Upload
        </button>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handlePick}
        />
      </div>

      <div
        className={cn(
          "relative flex flex-col border p-1 rounded-sm gap-1",
          "min-h-32 max-h-64 overflow-y-auto overflow-x-hidden",
          // Highlight while dragging
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
        {/* Overlay while dragging */}
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-sm bg-white/5">
            <div className="text-sm font-medium">Drop files to upload</div>
          </div>
        )}

        {files.length > 0 ? (
          files.map((file) => (
            <FileItem key={file.key} name={file.name} size={file.size} />
          ))
        ) : (
          <div className="text-white/50 italic text-sm text-center py-6">
            Drag & drop files here or click Upload.
          </div>
        )}
      </div>
    </div>
  );
}
