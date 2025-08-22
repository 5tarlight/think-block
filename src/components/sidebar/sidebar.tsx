import { useEffect, useRef, useState } from "react";
import { useSidebarStore } from "../../store/sidebarStore";
import HorizontalIcon from "../icon/HoriontalIcon";
import cn from "@yeahx4/cn";
import GPUSelector from "./gpu-selector";

const MIN_W = 200;
const MAX_W = 960;
const DEFAULT_W = 256;

export default function Sidebar() {
  const { isOpen, toggle, close } = useSidebarStore();

  const [width, setWidth] = useState<number>(DEFAULT_W);
  const [dragging, setDragging] = useState(false);

  const startXRef = useRef(0);
  const startWRef = useRef(width);

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    startXRef.current = e.clientX;
    startWRef.current = width;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    // UX: Prevent selecting while dragging
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - startXRef.current;
    const next = Math.max(MIN_W, Math.min(MAX_W, startWRef.current + dx));
    setWidth(next);
  };

  const onMouseUp = () => {
    setDragging(false);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  // Support Touch
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    setDragging(true);
    startXRef.current = e.touches[0].clientX;
    startWRef.current = width;
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    document.body.style.cursor = "col-resize";
    (document.body.style as any).webkitUserSelect = "none";
    document.body.style.userSelect = "none";
  };

  const onTouchMove = (e: TouchEvent) => {
    const dx = e.touches[0].clientX - startXRef.current;
    const next = Math.max(MIN_W, Math.min(MAX_W, startWRef.current + dx));
    setWidth(next);
  };

  const onTouchEnd = () => {
    setDragging(false);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    document.body.style.cursor = "";
    (document.body.style as any).webkitUserSelect = "";
    document.body.style.userSelect = "";
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  // Reset width width double click
  const resetWidth = () => setWidth(DEFAULT_W);

  return (
    <>
      {isOpen ? (
        // Expanded sidebar
        <div
          className={cn(
            "h-full bg-neutral-900 border-r border-neutral-700 flex relative",
            "flex-col ease-in-out shrink-0 text-white",
            dragging ? "" : "transition-[width] duration-150"
          )}
          style={{ width }}
        >
          <div
            className={cn(
              "p-4 flex justify-between items-center border-b",
              "border-neutral-600"
            )}
          >
            <h2 className="font-semibold text-lg">ThinkBlock</h2>
            <button
              onClick={close}
              className="p-1 rounded-full hover:bg-neutral-600"
              aria-label="Close sidebar"
            >
              <HorizontalIcon />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <GPUSelector />
          </div>

          {/* 드래그 핸들 */}
          <div
            role="separator"
            aria-orientation="vertical"
            title="드래그해서 너비 조절 (더블클릭: 기본 폭)"
            onMouseDown={onMouseDown}
            onDoubleClick={resetWidth}
            onTouchStart={onTouchStart}
            className={cn(
              "absolute top-0 right-0 h-full w-1 cursor-col-resize select-none",
              "bg-transparent hover:bg-neutral-700/40",
              // Increase hit area while dragging
              dragging ? "w-1.5" : "w-1"
            )}
          />
        </div>
      ) : (
        // Collapsed sidebar
        <div
          className={cn(
            "h-full w-8 bg-neutral-900 border-r border-neutral-700",
            "flex flex-col items-center py-4 transition-all duration-300",
            "ease-in-out shrink-0 text-white"
          )}
        >
          <button
            onClick={toggle}
            className="p-1 rounded-full hover:bg-neutral-600 mb-4"
            aria-label="Expand sidebar"
          >
            <HorizontalIcon left={false} />
          </button>
        </div>
      )}
    </>
  );
}
