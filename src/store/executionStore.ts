import { create } from "zustand";

export type ExecutionStatus = "idle" | "running" | "success" | "error";
export type NodeExecutionStatus = "waiting" | "running" | "success" | "error";

interface ExecutionState {
  status: ExecutionStatus;
  progress: number;
  message: string;
  durationMs: number | null;
  lastRunAt: number | null;
  nodeStatus: Record<string, NodeExecutionStatus>;
  start: (nodeIds: string[]) => void;
  setNodeStatus: (nodeId: string, status: NodeExecutionStatus) => void;
  setProgress: (progress: number) => void;
  succeed: (durationMs: number) => void;
  fail: (message: string, durationMs: number) => void;
  reset: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  status: "idle",
  progress: 0,
  message: "실행할 준비가 됐어요",
  durationMs: null,
  lastRunAt: null,
  nodeStatus: {},
  start: (nodeIds) =>
    set({
      status: "running",
      progress: 0,
      message: "그래프를 확인하고 있어요",
      durationMs: null,
      nodeStatus: Object.fromEntries(nodeIds.map((id) => [id, "waiting"])),
    }),
  setNodeStatus: (nodeId, status) =>
    set((state) => ({
      nodeStatus: { ...state.nodeStatus, [nodeId]: status },
      message: status === "running" ? "블록을 실행하고 있어요" : state.message,
    })),
  setProgress: (progress) => set({ progress }),
  succeed: (durationMs) =>
    set({
      status: "success",
      progress: 1,
      message: "모든 블록을 실행했어요",
      durationMs,
      lastRunAt: Date.now(),
    }),
  fail: (message, durationMs) =>
    set({
      status: "error",
      message,
      durationMs,
      lastRunAt: Date.now(),
    }),
  reset: () =>
    set({
      status: "idle",
      progress: 0,
      message: "실행할 준비가 됐어요",
      durationMs: null,
      nodeStatus: {},
    }),
}));
