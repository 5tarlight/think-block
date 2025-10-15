import { create } from "zustand";
import type { NodeType } from "../lib/node";
import type NodeImpl from "../lib/node-impl/NodeImpl";

export type Vec2 = { x: number; y: number };

export type Port = {
  id: string;
  name: string;
  kind: "in" | "out";
};

export type Node = {
  id: string;
  pos: Vec2;
  title: string;
  inputs: Port[];
  outputs: Port[];
  size: "full" | "small" | "input";
  type: NodeType;
  impl: NodeImpl | null;
};

export type Edge = {
  id: string;
  from: { node: string; port: string };
  to: { node: string; port: string };
};

export type Camera = { scale: number; tx: number; ty: number };

export const uid = (() => {
  let n = 0;
  return (p = "id") => `${p}_${(n++).toString(36)}`;
})();

export function screenToWorld(p: Vec2, camera: Camera): Vec2 {
  return {
    x: (p.x - camera.tx) / camera.scale,
    y: (p.y - camera.ty) / camera.scale,
  };
}

export function worldToScreen(p: Vec2, camera: Camera): Vec2 {
  return {
    x: p.x * camera.scale + camera.tx,
    y: p.y * camera.scale + camera.ty,
  };
}

export function cubicPath(a: Vec2, b: Vec2): string {
  const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
  const c1 = { x: a.x + dx, y: a.y };
  const c2 = { x: b.x - dx, y: b.y };
  return `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;
}

export interface CameraState {
  camera: Camera;
  setCamera: (f: (c: Camera) => Camera) => void;
}

export const useCameraState = create<CameraState>((set, get) => ({
  camera: { scale: 1, tx: 0, ty: 0 },
  setCamera: (f: (c: Camera) => Camera) => set({ camera: f(get().camera) }),
}));

export interface NodeState {
  nodes: Node[];
  selectedNodes: string[];
  errorNode: string | null;
  setNodes: (f: (nodes: Node[]) => Node[]) => void;
  setSelectedNodes: (f: (selected: string[]) => string[]) => void;
  addSelectedNodes: (id: string) => void;
  removeSelectedNodes: (id: string) => void;
  clearSelectedNodes: () => void;
  setErrorNode: (id: string | null) => void;
}

export const useNodeState = create<NodeState>((set, get) => ({
  nodes: [],
  selectedNodes: [],
  errorNode: null,
  setNodes: (f) => set({ nodes: f(get().nodes) }),
  setSelectedNodes: (f) => set({ selectedNodes: f(get().selectedNodes) }),
  addSelectedNodes: (id) =>
    set((state) =>
      state.selectedNodes.includes(id)
        ? state
        : { selectedNodes: [...state.selectedNodes, id] }
    ),
  removeSelectedNodes: (id) =>
    set((state) => ({
      selectedNodes: state.selectedNodes.filter((sid) => sid !== id),
    })),
  clearSelectedNodes: () => set({ selectedNodes: [] }),
  setErrorNode: (id) => set({ errorNode: id }),
}));

export interface EdgeState {
  edges: Edge[];
  setEdges: (f: (edges: Edge[]) => Edge[]) => void;
  removeEdge: (id: string) => void;
  removeEdgesConnectedToNode: (nodeId: string) => void;
}

export const useEdgeState = create<EdgeState>((set, get) => ({
  edges: [],
  setEdges: (f) => set({ edges: f(get().edges) }),
  removeEdge: (id: string) =>
    set((state) => ({ edges: state.edges.filter((e) => e.id !== id) })),
  removeEdgesConnectedToNode: (nodeId: string) =>
    set((state) => ({
      edges: state.edges.filter(
        (e) => e.from.node !== nodeId && e.to.node !== nodeId
      ),
    })),
}));
