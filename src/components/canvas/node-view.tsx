import cn from "@yeahx4/cn";
import type { Node } from "../../store/graphics";
import PortView from "./port-view";

export default function NodeView({
  node,
  onDragStart,
  onPortDown,
  onPortUp,
}: {
  node: Node;
  onDragStart: (e: React.MouseEvent, nodeId: string) => void;
  onPortDown: (
    e: React.MouseEvent,
    from: { nodeId: string; portId: string }
  ) => void;
  onPortUp: (to: { nodeId: string; portId: string }) => void;
}) {
  const inCount = node.inputs.length;
  const outCount = node.outputs.length;
  const rows = Math.max(inCount, outCount);
  const size = { w: 256, h: Math.max(80, 56 + 28 * rows + 4 * (rows - 1)) };

  return (
    <div
      className={cn(
        "absolute rounded-sm border border-neutral-700",
        "bg-neutral-900 text-neutral-200 shadow-lg",
        "hover:border-blue-500"
      )}
      style={{
        left: node.pos.x,
        top: node.pos.y,
        width: size.w,
        height: size.h,
      }}
      onMouseDown={(e) => {
        // 포트 클릭이 아닌 경우에만 노드 드래그 시작
        if (!(e.target as HTMLElement).closest(".port-handle")) {
          onDragStart(e, node.id);
        }
      }}
    >
      <div className="h-10 px-3 flex items-center justify-between rounded-t-sm bg-neutral-800 border-b border-neutral-700">
        <div className="font-sm">{node.title}</div>
        <div className="text-[10px] opacity-60">{node.id}</div>
      </div>

      <div className="grid grid-cols-2 gap-x-2 px-2 py-2 text-sm">
        <div className="flex flex-col gap-1">
          {node.inputs.map((p) => (
            <PortView
              key={p.id}
              label={p.name}
              side="left"
              onMouseUp={() => onPortUp({ nodeId: node.id, portId: p.id })}
            />
          ))}
        </div>
        <div className="flex flex-col gap-1 items-end">
          {node.outputs.map((p) => (
            <PortView
              key={p.id}
              label={p.name}
              side="right"
              onMouseDown={(e) =>
                onPortDown(e, { nodeId: node.id, portId: p.id })
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
