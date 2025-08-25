import cn from "@yeahx4/cn";

export default function PortView({
  label,
  side,
  onMouseDown,
  onMouseUp,
}: {
  label: string;
  side: "left" | "right";
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
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
          e.stopPropagation(); // 이벤트 버블링 방지
          onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          e.stopPropagation(); // 이벤트 버블링 방지
          onMouseUp?.();
        }}
        title={label}
      />
      <span className={cn("px-2 py-1")}>{label}</span>
    </div>
  );
}
