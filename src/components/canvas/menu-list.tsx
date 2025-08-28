import type { NodeType } from "../../lib/node";
import type { ContextMenuItem } from "./context-menu";
import MenuItem from "./menu-item";

export default function MenuList({
  menu,
  addNode,
}: {
  menu: ContextMenuItem[];
  addNode: (type: NodeType) => void;
}) {
  return (
    <div className="flex flex-col">
      {menu.map((item) =>
        item.isSubMenu ? (
          <div key={item.label} className="flex justify-between">
            <span>{item.label}</span>
            <span>▼</span>
          </div>
        ) : (
          <MenuItem
            key={item.label}
            label={item.label}
            onClick={() => addNode(item.type!)}
          />
        )
      )}
    </div>
  );
}
