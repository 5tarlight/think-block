import cn from "@yeahx4/cn";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NodeType } from "../../lib/node";
import type { Vec2 } from "../../store/graphics";
import MenuItem from "./menu-item";

export interface ContextMenuState {
  open: boolean;
  screen: Vec2;
  world: Vec2;
}

const items: Array<{ label: string; type: NodeType; keywords?: string[] }> = [
  { label: "Add Number", type: "Number", keywords: ["num", "value", "숫자"] },
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
    inputRef.current?.focus();
    inputRef.current?.select();
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

  const select = (idx: number) => {
    if (idx < 0 || idx >= list.length) return;
    addNode(list[idx].type);
    setMenu(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((v) => Math.min(list.length - 1, v + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((v) => Math.max(0, v - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setMenu(null);
    }
    // 이벤트가 바깥으로 전달되지 않도록
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
      {/* 검색 입력창 */}
      <div className="mb-2">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          onClick={(e) => e.stopPropagation()}
          placeholder="Search nodes…"
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
          list.map((it, i) => (
            <div
              key={it.label}
              onMouseEnter={() => setActive(i)}
              onClick={() => select(i)}
              className={cn(
                "rounded cursor-pointer",
                i === active ? "bg-neutral-700/70" : "hover:bg-neutral-800"
              )}
            >
              <MenuItem label={it.label} onClick={() => select(i)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
