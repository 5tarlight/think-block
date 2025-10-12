import { create } from "zustand";

export interface NodeDataState {
  data: Record<string, any>;
  setNodeData: (nodeId: string, data: Record<string, any>) => void;
  getNodeData: (nodeId: string) => Record<string, any> | undefined;
}

export const useNodeDataState = create<NodeDataState>((set, get) => ({
  data: {},
  setNodeData: (nodeId: string, data: Record<string, any>) => {
    set({
      ...get(),
      data: { ...get().data, [nodeId]: data },
    });
  },
  getNodeData: (nodeId: string) => {
    return get().data[nodeId];
  },
}));
