import cn from "@yeahx4/cn";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NodeType } from "../../lib/node";
import type { Vec2 } from "../../store/graphics";
import MenuList from "./menu-list";

export interface ContextMenuState {
  open: boolean;
  screen: Vec2;
  world: Vec2;
}

export interface ContextMenuItem {
  label: string;
  type?: NodeType;
  keywords?: string[];
  isSubMenu?: boolean;
  sub?: ContextMenuItem[];
}

const items: ContextMenuItem[] = [
  {
    label: "Data",
    isSubMenu: true,
    sub: [
      {
        label: "Add Number",
        type: "Number",
        keywords: ["num", "value", "숫자", "number", "integer", "float"],
      },
    ],
  },
  { label: "Add Add", type: "Add", keywords: ["plus", "sum", "더하기"] },
  {
    label: "Add Multiply",
    type: "Multiply",
    keywords: ["mul", "product", "곱"],
  },
  {
    label: "Add Output",
    type: "Output",
    keywords: ["print", "result", "출력"],
  },
];

export default function ContextMenu({
  menu,
  addNode,
  setMenu,
}: {
  menu: ContextMenuState;
  addNode: (type: NodeType) => void;
  setMenu: (menu: ContextMenuState | null) => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (menu.open) {
      inputRef.current?.focus();
    }
  }, [menu.open]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(({ label, keywords }) => {
      const base = label.toLowerCase();
      const keys = (keywords || []).join(" ").toLowerCase();
      return base.includes(s) || keys.includes(s);
    });
  }, [q]);

  useEffect(() => {
    if (active >= list.length) setActive(Math.max(0, list.length - 1));
  }, [list.length, active]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setMenu(null);
    }
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        "absolute z-1000000 w-72 rounded-sm border border-neutral-700",
        "bg-neutral-900/95 backdrop-blur text-sm shadow-lg p-2"
      )}
      style={{ left: menu.screen.x, top: menu.screen.y }}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      role="menu"
      aria-label="Context menu"
    >
      <div className="mb-2">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          onClick={(e) => e.stopPropagation()}
          placeholder="Search"
          className={cn(
            "w-full px-2 py-1 rounded border border-neutral-700",
            "bg-neutral-800 text-white placeholder:text-neutral-400",
            "focus:outline-none focus:ring-1 focus:ring-neutral-500"
          )}
        />
      </div>

      <div className="flex flex-col gap-1 max-h-64 overflow-auto pr-1">
        {list.length === 0 ? (
          <div className="px-2 py-1 text-neutral-400">No matches</div>
        ) : (
          <MenuList menu={list} addNode={addNode} />
        )}
      </div>
    </div>
  );
}
