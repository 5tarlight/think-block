import { create } from "zustand";

export interface NodeDataState {
  data: Record<string, Record<string, unknown>>;
  setNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  getNodeData: (nodeId: string) => Record<string, unknown> | undefined;
  replaceData: (data: Record<string, Record<string, unknown>>) => void;
  removeNodeData: (nodeId: string) => void;
  clearData: () => void;
}

export const useNodeDataState = create<NodeDataState>((set, get) => ({
  data: {},
  setNodeData: (nodeId: string, data: Record<string, unknown>) => {
    set({
      ...get(),
      data: { ...get().data, [nodeId]: data },
    });
  },
  getNodeData: (nodeId: string) => {
    return get().data[nodeId];
  },
  replaceData: (data) => set({ data }),
  removeNodeData: (nodeId) =>
    set((state) => ({
      data: Object.fromEntries(
        Object.entries(state.data).filter(([id]) => id !== nodeId)
      ),
    })),
  clearData: () => set({ data: {} }),
}));
