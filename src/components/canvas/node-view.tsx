import cn from "@yeahx4/cn";
import { Tensor } from "@tensorflow/tfjs";
import { useEffect, useState } from "react";
import { TbSettings } from "react-icons/tb";
import CSV from "../../lib/data/csv";
import { getNodeCategory } from "../../lib/node";
import type NodeImpl from "../../lib/node-impl/NodeImpl";
import { useExecutionStore } from "../../store/executionStore";
import { getNodeSize, type Node } from "../../store/graphics";
import { useNodeDataState } from "../../store/nodeDataStore";
import { useWinStore } from "../../store/windowStore";
import PortView from "./port-view";

function formatPreview(value: unknown) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "계산 중";
    return Math.abs(value) >= 1000
      ? value.toExponential(2)
      : value.toLocaleString("ko-KR", { maximumFractionDigits: 4 });
  }
  if (typeof value === "string" || typeof value === "boolean") return String(value);
  if (value instanceof Tensor) return `Tensor [${value.shape.join(" × ")}]`;
  if (value instanceof CSV) return `표 ${value.getRows()} × ${value.getColumns()}`;
  if (value && typeof value === "object" && "kind" in value) return "학습된 모델";
  return null;
}

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
  onDragStart: (event: React.MouseEvent, nodeId: string) => void;
  onPortDown: (
    event: React.MouseEvent,
    from: { nodeId: string; portId: string }
  ) => void;
  onPortUp: (to: { nodeId: string; portId: string }) => void;
  impl: NodeImpl | null;
  selected: boolean;
  onClick: (event: React.MouseEvent, nodeId: string) => void;
  hasError: boolean;
}) {
  const size = getNodeSize(node);
  const [popupId, setPopupId] = useState<string | null>(null);
  const { addWindow, windows } = useWinStore();
  const { getNodeData, setNodeData } = useNodeDataState();
  const executionStatus = useExecutionStore(
    (state) => state.nodeStatus[node.id]
  );
  const category = getNodeCategory(node.type);
  const data = getNodeData(node.id);
  const rawValue = data?.value;
  const inputValue = typeof rawValue === "number" ? String(rawValue) : "0";
  const outputPreview = formatPreview(data?.data);

  const openWindow = () => {
    if (!impl || popupId) return;
    const component = impl.render();
    if (!component) return;
    const id = addWindow(
      { title: `${node.title} · ${node.id}` },
      component,
      impl.winWidth,
      impl.winHeight
    );
    setPopupId(id);
  };

  useEffect(() => {
    if (popupId && !windows.some((window) => window.id === popupId)) {
      setPopupId(null);
    }
  }, [popupId, windows]);

  return (
    <div
      className={cn(
        "node-card",
        `node-card--${category}`,
        selected ? "is-selected" : "",
        hasError ? "has-error" : "",
        executionStatus ? `is-${executionStatus}` : "",
        node.size !== "full" ? `node-card--${node.size}` : ""
      )}
      style={{ left: node.pos.x, top: node.pos.y, width: size.w, height: size.h }}
      onMouseDown={(event) => {
        if (!(event.target as HTMLElement).closest(".port-handle, input, button")) {
          onDragStart(event, node.id);
        }
      }}
      onDoubleClick={openWindow}
      onClick={(event) => onClick(event, node.id)}
      title={impl?.render() ? "더블 클릭해 설정 열기" : undefined}
    >
      {node.size === "full" && (
        <div className="node-card__header">
          <span className="node-card__category" aria-hidden="true" />
          <strong>{node.title}</strong>
          <span className="node-card__status" aria-label={executionStatus ?? "대기"} />
          {impl?.render() && <TbSettings className="node-card__settings" />}
        </div>
      )}

      <div className="node-card__body">
        <div className="port-column port-column--inputs">
          {node.inputs.map((port) => (
            <PortView
              key={port.id}
              label={port.name}
              side="left"
              onMouseUp={() => onPortUp({ nodeId: node.id, portId: port.id })}
            />
          ))}
        </div>

        {node.type === "output" && outputPreview && (
          <span className="node-card__preview">{outputPreview}</span>
        )}

        {node.type === "csv" && (
          <span className="node-card__preview node-card__preview--file">
            {typeof data?.fileKey === "string" ? "파일 선택됨" : "파일 없음"}
          </span>
        )}

        <div className="port-column port-column--outputs">
          {node.outputs.map((port) => (
            <PortView
              key={port.id}
              label={port.name}
              side="right"
              onMouseDown={(event) =>
                onPortDown(event, { nodeId: node.id, portId: port.id })
              }
              isInput={node.size === "input"}
              inputValue={inputValue}
              setInputValue={(value) => {
                const parsed = Number(value);
                setNodeData(node.id, { value: Number.isFinite(parsed) ? parsed : 0 });
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
