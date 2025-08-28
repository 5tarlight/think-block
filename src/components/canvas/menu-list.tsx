import { useEffect, useRef, useState } from "react";
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

  const overTriggerRef = useRef(false);
  const overPortalRef = useRef(false);

  const closeTimer = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    // Close when not hovering over trigger or portal
    closeTimer.current = window.setTimeout(() => {
      if (!overTriggerRef.current && !overPortalRef.current) {
        setSubInfo(null);
      }
    }, 120);
  };

  const openSub = (
    label: string,
    items: ContextMenuItem[],
    el: HTMLElement
  ) => {
    clearCloseTimer();
    const rect = el.getBoundingClientRect();
    setSubInfo({ label, items, anchorRect: rect });
  };

  useEffect(() => clearCloseTimer, []);

  return (
    <div className="flex flex-col relative text-white">
      {menu.map((item) =>
        item.isSubMenu ? (
          <SubTrigger
            key={item.label}
            label={item.label}
            onEnter={(el) => {
              overTriggerRef.current = true;
              if (item.sub) openSub(item.label, item.sub, el);
            }}
            onLeave={() => {
              overTriggerRef.current = false;
              scheduleClose();
            }}
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
              clearCloseTimer();
              overPortalRef.current = true;
            }}
            onMouseLeave={() => {
              overPortalRef.current = false;
              scheduleClose();
            }}
          />,
          document.body
        )}
    </div>
  );
}
