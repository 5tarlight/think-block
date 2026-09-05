import cn from "@yeahx4/cn";
import { TbAlertTriangle, TbCheck, TbPlayerPlay } from "react-icons/tb";
import { runGraph } from "../../lib/execution/run-graph";
import { useEdgeState, useNodeState } from "../../store/graphics";
import { useExecutionStore } from "../../store/executionStore";

export default function ExecuteButton({ compact = false }: { compact?: boolean }) {
  const { nodes } = useNodeState();
  const { edges } = useEdgeState();
  const { status, progress } = useExecutionStore();
  const isRunning = status === "running";

  return (
    <button
      className={cn("run-button", compact ? "run-button--compact" : "")}
      onClick={() => void runGraph(nodes, edges)}
      disabled={isRunning}
      type="button"
    >
      <span className="run-button__icon" aria-hidden="true">
        {status === "error" ? (
          <TbAlertTriangle />
        ) : status === "success" ? (
          <TbCheck />
        ) : (
          <TbPlayerPlay />
        )}
      </span>
      <span>{isRunning ? `실행 중 ${Math.round(progress * 100)}%` : "그래프 실행"}</span>
      {isRunning && (
        <span
          className="run-button__progress"
          style={{ width: `${Math.max(4, progress * 100)}%` }}
        />
      )}
    </button>
  );
}
