import cn from "@yeahx4/cn";

export default function MenuItem({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "w-full text-left rounded-sm p-1 hover:bg-neutral-800",
        "active:bg-neutral-700"
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
