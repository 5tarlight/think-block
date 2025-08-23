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
          ? "flex items-center gap-2"
          : "flex items-center gap-2 flex-row-reverse"
      }
    >
      <span className="px-2 py-1 rounded-md bg-neutral-800/80 border border-neutral-700">
        {label}
      </span>
      <span
        className="relative inline-block w-3 h-3 rounded-full bg-blue-400 ring-2 ring-blue-300/40 cursor-crosshair"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        title={label}
      />
    </div>
  );
}
