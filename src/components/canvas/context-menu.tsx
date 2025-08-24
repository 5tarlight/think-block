import type { NodeType } from "../../lib/node";
import type { Vec2 } from "../../store/graphics";
import MenuItem from "./menu-item";

export interface ContextMenuState {
  open: boolean;
  screen: Vec2;
  world: Vec2;
}

export default function ContextMenu({
  menu,
  addNode,
  setMenu,
}: {
  menu: ContextMenuState;
  addNode: (type: NodeType) => void;
  setMenu: (menu: ContextMenuState | null) => void;
}) {
  return (
    <div
      className="absolute z-50 min-w-40 rounded-xl border border-neutral-700 bg-neutral-900/95 backdrop-blur p-1 text-sm shadow-lg"
      style={{ left: menu.screen.x, top: menu.screen.y }}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <MenuItem label="Add Number" onClick={() => addNode("Number")} />
      <MenuItem label="Add Add" onClick={() => addNode("Add")} />
      <MenuItem label="Add Multiply" onClick={() => addNode("Multiply")} />
      <MenuItem label="Add Output" onClick={() => addNode("Output")} />
      <hr className="my-1 border-neutral-700" />
      <MenuItem label="Close" onClick={() => setMenu(null)} />
    </div>
  );
}
