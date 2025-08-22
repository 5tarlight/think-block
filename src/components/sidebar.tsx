import { useSidebarStore } from "../store/sidebarStore";
import HorizontalIcon from "./icon/HoriontalIcon";
import cn from "@yeahx4/cn";

export default function Sidebar() {
  const { isOpen, toggle, close } = useSidebarStore();

  return (
    <>
      {isOpen ? (
        // Expanded sidebar
        <div
          className={cn(
            "h-full w-64 bg-neutral-900 border-r border-neutral-700 flex",
            "flex-col transition-all duration-300 ease-in-out shrink-0",
            "text-white"
          )}
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
          <div className="flex-1 p-4 overflow-y-auto">Open Sidebar Content</div>
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
