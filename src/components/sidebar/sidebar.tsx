import { useEffect, useRef, useState } from "react";
import { useSidebarStore } from "../../store/sidebarStore";
import HorizontalIcon from "../icon/HoriontalIcon";
import cn from "@yeahx4/cn";
import GPUSelector from "./gpu-selector";
import FileUploader from "./file-uploader";
import ExecuteButton from "./execute-button";

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
            "flex-col ease-in-out shrink-0 text-white justify-between",
            dragging ? "" : "transition-[width] duration-150"
          )}
          style={{ width }}
        >
          <div className="flex flex-col">
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
              <FileUploader />
            </div>

            {/* Drag handle */}
            <div
              role="separator"
              aria-orientation="vertical"
              title="Double click to reset width"
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
          <div className="p-4 flex flex-col gap-8">
            <ExecuteButton />
            <footer
              className={cn(
                "text-sm text-center border-t border-neutral-600",
                "pt-4 text-neutral-400 flex flex-col items-center gap-1"
              )}
            >
              <span>
                &copy;
                {new Date().getFullYear() === 2025
                  ? " 2025"
                  : " 2025-" + new Date().getFullYear()}{" "}
                YEAHx4
              </span>
              <div className="flex justify-center gap-2">
                <a
                  href="https://github.com/5tarlight/think-block"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-white"
                >
                  GitHub
                </a>
                <a
                  href="https://post.yeahx4.me"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-white"
                >
                  Blog
                </a>
              </div>
            </footer>
          </div>
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
