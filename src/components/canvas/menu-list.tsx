import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { NodeType } from "../../lib/node";
import type { ContextMenuItem } from "./context-menu";
import MenuItem from "./menu-item";
import cn from "@yeahx4/cn";

type SubInfo = {
  label: string;
  items: ContextMenuItem[];
  anchorRect: DOMRect;
};

export default function MenuList({
  menu,
  addNode,
}: {
  menu: ContextMenuItem[];
  addNode: (type: NodeType) => void;
}) {
  const [subInfo, setSubInfo] = useState<SubInfo | null>(null);
  const [hoveringSub, setHoveringSub] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const openSub = (
    label: string,
    items: ContextMenuItem[],
    el: HTMLElement
  ) => {
    const rect = el.getBoundingClientRect();
    setSubInfo({ label, items, anchorRect: rect });
  };

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    // Delay to allow mouse to enter portal submenu
    closeTimer.current = window.setTimeout(() => {
      if (!hoveringSub) setSubInfo(null);
    }, 80);
  };

  return (
    <div className="flex flex-col relative text-white">
      {menu.map((item) =>
        item.isSubMenu ? (
          <SubTrigger
            key={item.label}
            label={item.label}
            onEnter={(el) => item.sub && openSub(item.label, item.sub, el)}
            onLeave={scheduleClose}
          />
        ) : (
          <MenuItem
            key={item.label}
            label={item.label}
            onClick={() => addNode(item.type!)}
          />
        )
      )}

      {subInfo &&
        createPortal(
          <SubMenuPortal
            info={subInfo}
            addNode={addNode}
            onMouseEnter={() => {
              if (closeTimer.current) window.clearTimeout(closeTimer.current);
              setHoveringSub(true);
            }}
            onMouseLeave={() => {
              setHoveringSub(false);
              setSubInfo(null);
            }}
          />,
          document.body
        )}
    </div>
  );
}

function SubTrigger({
  label,
  onEnter,
  onLeave,
}: {
  label: string;
  onEnter: (el: HTMLElement) => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between px-2 py-1 cursor-pointer",
        "hover:bg-neutral-700 select-none"
      )}
      onMouseEnter={() => ref.current && onEnter(ref.current)}
      onMouseLeave={onLeave}
    >
      <span>{label}</span>
      <span>▶</span>
    </div>
  );
}

function SubMenuPortal({
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
    const margin = 6;
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "fixed z-1000001 w-64 max-h-[70vh] overflow-auto",
        "bg-neutral-800 border border-neutral-600 rounded shadow-xl",
        "text-white"
      )}
      style={style}
    >
      <MenuList menu={items} addNode={addNode} />
    </div>
  );
}
