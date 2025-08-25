import cn from "@yeahx4/cn";
import { useWinStore, type Win } from "../../store/windowStore";
import type { ReactNode } from "react";

export default function WindowView({
  window,
  children,
}: {
  window: Win;
  children?: ReactNode;
}) {
  const { removeWindow } = useWinStore();

  return (
    <div
      className={cn(
        "bg-neutral-900 border border-neutral-700 rounded",
        "flex flex-col"
      )}
      style={{
        position: "absolute",
        left: window.x,
        top: window.y,
        width: window.width,
        height: window.height,
        zIndex: window.z,
      }}
    >
      <div
        className={cn(
          "border-b border-neutral-700 py-1 px-2 flex justify-between",
          "items-center"
        )}
      >
        <div
          className={cn(
            "w-3 h-3 bg-red-500 rounded-full cursor-pointer",
            "text-[8px] flex justify-center items-center text-red-800",
            "font-bold hover:font-extrabold"
          )}
          onClick={() => removeWindow(window.id)}
        >
          X
        </div>
        <div className="font-bold">{window.title}</div>
        <div className="text-sm text-neutral-400">{window.id}</div>
      </div>
      <div className={cn("flex-1 p-2")}>{children}</div>
    </div>
  );
}
