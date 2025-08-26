import cn from "@yeahx4/cn";
import { formatBytes } from "../sidebar/file-item";
import type { UIFile } from "../sidebar/file-uploader";

export default function FileWindowContent({ file }: { file: UIFile }) {
  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : "";

  return (
    <div className="w-full h-full p-4 text-sm text-white/90">
      <div className="flex items-center justify-between mb-4">
        <div className="truncate font-medium">{file.name}</div>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium bg-red-600/20",
            "text-red-300 border border-red-500/30 hover:bg-red-600/30",
            "cursor-pointer"
          )}
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-[110px_1fr] gap-y-2 gap-x-4">
        <div className="text-white/60">Name</div>
        <div className="truncate">{file.name}</div>

        <div className="text-white/60">Extension</div>
        <div className="uppercase">{ext || "-"}</div>

        <div className="text-white/60">Size</div>
        <div>{formatBytes(file.size)}</div>

        <div className="text-white/60">MIME</div>
        <div>{file.raw.type || "-"}</div>

        <div className="text-white/60">Last Modified</div>
        <div>{formatDate(new Date(file.raw.lastModified))}</div>

        <div className="text-white/60">Key</div>
        <div className="font-mono break-all">{file.key}</div>
      </div>
    </div>
  );
}

export function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}
