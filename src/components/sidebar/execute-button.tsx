import cn from "@yeahx4/cn";

export default function ExecuteButton() {
  const onExecute = () => {
    console.log("Execute clicked");
  };

  return (
    <button
      className={cn(
        "w-full p-2 bg-blue-500 rounded-sm transition-colors",
        "hover:bg-blue-400 cursor-pointer"
      )}
      onClick={onExecute}
    >
      Execute
    </button>
  );
}
