import cn from "@yeahx4/cn";

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
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  isInput?: boolean;
  inputValue?: string;
  setInputValue?: (value: string) => void;
}) {
  return (
    <div
      className={
        side === "left"
          ? "flex items-center gap-1"
          : "flex items-center gap-1 flex-row-reverse"
      }
    >
      <span
        className={cn(
          "relative inline-block w-2 h-2 rounded-full",
          "bg-blue-400 cursor-crosshair port-handle",
          "hover:scale-125 transition-transform"
        )}
        onMouseDown={(e) => {
          e.stopPropagation();
          onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onMouseUp?.();
        }}
        title={label}
      />
      {isInput ? (
        <input
          className={cn(
            "px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-sm",
            "h-7 w-24 outline-none"
          )}
          value={inputValue}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            (e.target as HTMLInputElement).focus();
          }}
          onChange={(e) => setInputValue?.(e.target.value)}
        />
      ) : (
        <span className={cn("px-2 py-1")}>{label}</span>
      )}
    </div>
  );
}
