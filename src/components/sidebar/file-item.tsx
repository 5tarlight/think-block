import cn from "@yeahx4/cn";
import { useEffect, useState, type ReactNode } from "react";
import { TbCsv, TbFile, TbJpg, TbJson, TbPng, TbTxt } from "react-icons/tb";
import type { UIFile } from "./file-uploader";
import { useWinStore } from "../../store/windowStore";

export type FileStatus = "pending" | "reading" | "done" | "error";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export default function FileItem({
  name,
  size,
  progress = 0,
  status = "pending",
  file,
}: {
  name: string;
  size: number;
  progress?: number;
  status?: FileStatus;
  file: UIFile;
}) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  let icon: ReactNode;
  if (ext === "csv") icon = <TbCsv />;
  else if (ext === "json") icon = <TbJson />;
  else if (ext === "png") icon = <TbPng />;
  else if (ext === "jpg" || ext === "jpeg") icon = <TbJpg />;
  else if (ext === "txt") icon = <TbTxt />;
  else icon = <TbFile />;

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupId, setPopupId] = useState<string | null>(null);
  const { addWindow, removeWindow, windows } = useWinStore();

  useEffect(() => {
    if (isPopupOpen && !windows.find((w) => w.id === popupId)) {
      setIsPopupOpen(false);
      setPopupId(null);
    }
  }, [windows]);

  const handleOpenPopup = () => {
    if (isPopupOpen) {
      removeWindow(popupId!);
    } else {
      const id = addWindow({ title: name });
      setPopupId(id);
    }

    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div
      className={cn(
        "group relative flex justify-between items-center text-sm cursor-pointer",
        "hover:bg-white/10 px-1 py-1 rounded-sm transition-all"
      )}
      title={name}
      onClick={handleOpenPopup}
      role="button"
    >
      <div className="flex gap-2 items-center min-w-0">
        <div className="shrink-0">{icon}</div>
        <div className="truncate max-w-[160px]">{name}</div>
      </div>
      <div className="text-xs shrink-0 tabular-nums text-white/70">
        {formatBytes(size)}
      </div>

      {status !== "done" && (
        <div className="absolute left-1 right-1 bottom-0.5 h-1 rounded bg-white/10 overflow-hidden">
          <div
            className={cn(
              "h-full rounded",
              status === "error" ? "bg-red-500" : "bg-blue-500"
            )}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
