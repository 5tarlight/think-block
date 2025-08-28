import cn from "@yeahx4/cn";
import { useRef } from "react";

export default function SubTrigger({
  label,
  onEnter,
  onLeave,
}: {
  label: string;
  onEnter: (el: HTMLElement) => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between p-1 cursor-pointer",
        "hover:bg-neutral-800 select-none rounded-sm",
        "active:bg-neutral-700"
      )}
      onMouseEnter={() => ref.current && onEnter(ref.current)}
      onMouseLeave={onLeave}
    >
      <span>{label}</span>
      <span>▶</span>
    </div>
  );
}
