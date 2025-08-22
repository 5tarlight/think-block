import cn from "@yeahx4/cn";
import type { ReactNode } from "react";
import { TbCsv, TbFile, TbJpg, TbJson, TbPng, TbTxt } from "react-icons/tb";

export default function FileItem({ name }: { name: string; size: number }) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  let icon: ReactNode;

  if (ext === "csv") {
    icon = <TbCsv />;
  } else if (ext === "json") {
    icon = <TbJson />;
  } else if (ext === "png") {
    icon = <TbPng />;
  } else if (ext === "jpg" || ext === "jpeg") {
    icon = <TbJpg />;
  } else if (ext === "txt") {
    icon = <TbTxt />;
  } else {
    icon = <TbFile />;
  }

  return (
    <div
      className={cn(
        "flex justify-between items-center text-sm cursor-pointer",
        "hover:bg-white/10 px-1 py-0.5 rounded-sm transition-all"
      )}
      title={name}
    >
      <div className="flex gap-2 items-center min-w-0">
        <div className="shrink-0">{icon}</div>
        <div className="truncate max-w-[160px]">{name}</div>
      </div>
    </div>
  );
}
