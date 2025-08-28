import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { NodeType } from "../../lib/node";
import type { SubInfo } from "./menu-list";
import cn from "@yeahx4/cn";
import MenuList from "./menu-list";

export default function SubMenuPortal({
  info,
  addNode,
  onMouseEnter,
  onMouseLeave,
}: {
  info: SubInfo;
  addNode: (type: NodeType) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  // Position calculation: default to right, flip to left if not enough space
  useLayoutEffect(() => {
    const { anchorRect } = info;
    const vw = window.innerWidth;
    const margin = 16;
    const estimatedWidth = 256; // w-64
    let left = anchorRect.right + margin;
    let top = anchorRect.top;

    if (left + estimatedWidth > vw) {
      left = anchorRect.left - margin - estimatedWidth;
    }

    // Vertical clamp (prevent going off-screen)
    const maxTop = Math.max(8, Math.min(top, window.innerHeight - 8));
    setStyle({ top: maxTop, left: Math.max(8, left) });
  }, [info]);

  const items = useMemo(() => info.items, [info.items]);

  return (
    <div
      ref={panelRef}
      onMouseEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onMouseEnter();
      }}
      onMouseLeave={onMouseLeave}
      className={cn(
        "fixed z-1000000 w-64 max-h-[70vh] overflow-auto",
        "bg-neutral-900 border border-neutral-600 rounded shadow-xl",
        "text-white p-1"
      )}
      style={style}
    >
      <MenuList menu={items} addNode={addNode} />
    </div>
  );
}
