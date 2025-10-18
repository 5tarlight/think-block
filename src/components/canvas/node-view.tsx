import cn from "@yeahx4/cn";
import type { Node } from "../../store/graphics";
import PortView from "./port-view";
import { useEffect, useState } from "react";
import type NodeImpl from "../../lib/node-impl/NodeImpl";
import { useWinStore } from "../../store/windowStore";
import { useNodeDataState } from "../../store/nodeDataStore";

export default function NodeView({
  node,
  onDragStart,
  onPortDown,
  onPortUp,
  impl,
  selected,
  onClick,
  hasError,
}: {
  node: Node;
  onDragStart: (e: React.MouseEvent, nodeId: string) => void;
  onPortDown: (
    e: React.MouseEvent,
    from: { nodeId: string; portId: string }
  ) => void;
  onPortUp: (to: { nodeId: string; portId: string }) => void;
  impl: NodeImpl | null;
  selected: boolean;
  onClick: (e: React.MouseEvent, nodeId: string) => void;
  hasError: boolean;
}) {
  const inCount = node.inputs.length;
  const outCount = node.outputs.length;
  const rows = Math.max(inCount, outCount);
  const size = { w: 256, h: -1 };

  if (node.size === "full") {
    size.h = Math.max(80, 56 + 28 * rows + 4 * (rows - 1));
  } else if (node.size === "small") {
    size.h = 16 + 28 * rows + 4 * (rows - 1);
    size.w = 164;
  } else if (node.size === "input") {
    size.h = 44;
    size.w = 124;
  }

  const [popupId, setPopupId] = useState<string | null>(null);
  const { addWindow, windows } = useWinStore();
  const { getNodeData, setNodeData } = useNodeDataState();

  const openWindow = () => {
    if (!impl) return;
    if (popupId) return;

    const component = impl.render();
    if (!component) return;

    const id = addWindow(
      { title: `${node.title} (${node.id})` },
      component,
      impl.winWidth,
      impl.winHeight
    );
    setPopupId(id);
  };

  const inputValue = getNodeData(node.id)?.value || 0;

  const setInputValue = (value: string) => {
    setNodeData(node.id, { value: parseFloat(value) });
  };

  useEffect(() => {
    if (popupId && !windows.find((w) => w.id === popupId)) {
      setPopupId(null);
    }
  }, [windows, popupId]);

  return (
    <div
      className={cn(
        "absolute rounded-sm border ",
        "bg-neutral-900 text-neutral-200 shadow-lg",
        hasError
          ? "border-red-500"
          : selected
          ? "border-blue-500"
          : "border-neutral-700"
      )}
      style={{
        left: node.pos.x,
        top: node.pos.y,
        width: size.w,
        height: size.h,
      }}
      onMouseDown={(e) => {
        // Start dragging
        if (!(e.target as HTMLElement).closest(".port-handle")) {
          onDragStart(e, node.id);
        }
      }}
      onDoubleClick={openWindow}
      onClick={(e) => onClick(e, node.id)}
    >
      {node.size === "full" && (
        <div
          className={cn(
            "h-10 px-3 flex items-center justify-between rounded-t-sm",
            "bg-neutral-800 border-b border-neutral-700"
          )}
        >
          <div className="font-sm">{node.title}</div>
          <div className="text-[10px] opacity-60">{node.id}</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-2 px-2 py-2 text-sm">
        {node.type === "output" ? ( // Output node shows input data
          <div className="flex items-center">
            {node.inputs.map((p) => (
              <PortView
                key={p.id}
                label={p.name}
                side="left"
                onMouseUp={() => onPortUp({ nodeId: node.id, portId: p.id })}
              />
            ))}
            <span className={cn("ml-2 opacity-70 italic whitespace-nowrap")}>
              {(() => {
                const data = getNodeData(node.id)?.data;
                if (
                  data !== null &&
                  data !== undefined &&
                  typeof data !== "object"
                )
                  return `= ${Math.round(data * 10000) / 10000}`;
              })()}
            </span>
          </div>
        ) : (
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
        )}
        <div className="flex flex-col gap-1 items-end">
          {node.type === "csv" ? (
            <div className="flex items-center">
              <span
                className={cn(
                  "mr-2 opacity-70 italic w-full",
                  "text-right whitespace-nowrap"
                )}
              >
                {(() => {
                  const data = getNodeData(node.id)?.fileKey;
                  if (!data) return "<no file> =";
                  const display =
                    data.length > 12 ? data.slice(0, 10) + "..." : data;
                  return `${display} =`;
                })()}
              </span>
              {node.outputs.map((p) => (
                <PortView
                  key={p.id}
                  label={p.name}
                  side="right"
                  onMouseDown={(e) =>
                    onPortDown(e, { nodeId: node.id, portId: p.id })
                  }
                  isInput={node.size === "input"}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                />
              ))}
            </div>
          ) : (
            node.outputs.map((p) => (
              <PortView
                key={p.id}
                label={p.name}
                side="right"
                onMouseDown={(e) =>
                  onPortDown(e, { nodeId: node.id, portId: p.id })
                }
                isInput={node.size === "input"}
                inputValue={inputValue}
                setInputValue={setInputValue}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
