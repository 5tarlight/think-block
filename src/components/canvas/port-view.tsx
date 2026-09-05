import { useNodeState } from "../../store/graphics";

export default function PortView({
  label,
  side,
  onMouseDown,
  onMouseUp,
  isInput,
  inputValue,
  setInputValue,
}: {
  label: string;
  side: "left" | "right";
  onMouseDown?: (event: React.MouseEvent) => void;
  onMouseUp?: () => void;
  isInput?: boolean;
  inputValue?: string;
  setInputValue?: (value: string) => void;
}) {
  const clearSelectedNodes = useNodeState((state) => state.clearSelectedNodes);

  return (
    <div className={`port-row port-row--${side}`}>
      <span
        className="port-handle"
        onMouseDown={(event) => {
          event.stopPropagation();
          onMouseDown?.(event);
        }}
        onMouseUp={(event) => {
          event.stopPropagation();
          onMouseUp?.();
        }}
        title={`${label} 포트`}
      />
      {isInput ? (
        <input
          className="port-number-input"
          type="number"
          step="any"
          value={inputValue}
          aria-label={`${label} 값`}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            clearSelectedNodes();
          }}
          onChange={(event) => setInputValue?.(event.target.value)}
        />
      ) : (
        <span className="port-label">{label}</span>
      )}
    </div>
  );
}
