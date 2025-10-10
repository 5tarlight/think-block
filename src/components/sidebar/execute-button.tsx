import cn from "@yeahx4/cn";
import { useEdgeState, useNodeState } from "../../store/graphics";
import { buildLayers } from "../../lib/execution/execution";

export default function ExecuteButton() {
  const { nodes } = useNodeState();
  const { edges } = useEdgeState();

  const onExecute = () => {
    const layer = buildLayers(nodes, edges);
    console.log("Execution layers:", layer);
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
