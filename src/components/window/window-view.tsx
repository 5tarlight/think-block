import cn from "@yeahx4/cn";
import { useRef, useEffect, type ReactNode } from "react";
import { useWinStore, type Win } from "../../store/windowStore";

export default function WindowView({
  window: win,
  children,
}: {
  window: Win;
  children?: ReactNode;
}) {
  const { removeWindow, bringToFront, moveWindow } = useWinStore();

  const draggingRef = useRef(false);
  const offsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!draggingRef.current) return;
      const x = e.clientX - offsetRef.current.dx;
      const y = e.clientY - offsetRef.current.dy;
      moveWindow(win.id, x, y);
    }
    function onUp() {
      draggingRef.current = false;
      document.body.style.cursor = "";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [moveWindow, win.id]);

  const onDragStart: React.MouseEventHandler<HTMLDivElement> = (e) => {
    bringToFront(win.id);
    draggingRef.current = true;
    offsetRef.current = {
      dx: e.clientX - win.x,
      dy: e.clientY - win.y,
    };
    document.body.style.cursor = "grabbing";
  };

  return (
    <div
      className={cn(
        "bg-neutral-900 border border-neutral-700 rounded",
        "flex flex-col shadow-xl"
      )}
      style={{
        position: "absolute",
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.z,
      }}
      onMouseDown={() => bringToFront(win.id)}
    >
      <div
        className={cn(
          "border-b border-neutral-700 py-1 px-2 flex justify-between items-center",
          "cursor-grab active:cursor-grabbing select-none"
        )}
        onMouseDown={onDragStart}
      >
        <div
          className={cn(
            "w-3 h-3 bg-red-500 rounded-full cursor-pointer",
            "text-[8px] flex justify-center items-center text-red-800",
            "font-bold hover:font-extrabold"
          )}
          onClick={() => removeWindow(win.id)}
        >
          X
        </div>
        <div className="font-bold truncate px-2">{win.title}</div>
        <div className="text-sm text-neutral-400">{win.id}</div>
      </div>
      <div className={cn("flex-1 p-2 overflow-auto")}>{children}</div>
    </div>
  );
}
