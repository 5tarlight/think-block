import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { NodeType } from "../../lib/node";
import type { ContextMenuItem } from "./context-menu";
import MenuItem from "./menu-item";
import SubTrigger from "./sub-trigger";
import SubMenuPortal from "./sub-menu-portal";

export type SubInfo = {
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
