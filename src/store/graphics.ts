import { create } from "zustand";

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
  setNodes: (f: (nodes: Node[]) => Node[]) => void;
}

export const useNodeState = create<NodeState>((set, get) => ({
  nodes: [],
  setNodes: (f) => set({ nodes: f(get().nodes) }),
}));

export interface EdgeState {
  edges: Edge[];
  setEdges: (f: (edges: Edge[]) => Edge[]) => void;
}

export const useEdgeState = create<EdgeState>((set, get) => ({
  edges: [],
  setEdges: (f) => set({ edges: f(get().edges) }),
}));
