import { create } from "zustand";
import { uid } from "./graphics";
import type { ReactNode } from "react";

export interface Win {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
}

const BASE_Z = 10;

const BASE_OFFSET_X = 48;
const BASE_OFFSET_Y = 48;
const STEP = 28;
const WRAP = 10;

export interface WinState {
  windows: Win[];
  contents: Record<string, ReactNode>;
  addWindow: (
    win: { title: string },
    content?: ReactNode,
    width?: number,
    height?: number
  ) => string;
  removeWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
}

function nextTopZ(windows: Win[]) {
  if (windows.length === 0) return BASE_Z;
  const maxZ = Math.max(...windows.map((w) => w.z));
  return Math.max(maxZ + 1, BASE_Z);
}

function cascadeOffset(index: number) {
  // index: 현재까지 열린 창 개수
  const k = index % WRAP; // 래핑
  const dx = BASE_OFFSET_X + STEP * k;
  const dy = BASE_OFFSET_Y + STEP * k;
  return { dx, dy };
}

export const useWinStore = create<WinState>((set) => ({
  windows: [],
  contents: {},
  addWindow: (win, content, width, height) => {
    const id = uid("win");
    const w = width || 500;
    const h = height || 400;

    set((state) => {
      const z = nextTopZ(state.windows);
      const { dx, dy } = cascadeOffset(state.windows.length);

      return {
        windows: [
          ...state.windows,
          {
            ...win,
            id,
            x: dx,
            y: dy,
            width: w,
            height: h,
            z,
          },
        ],
        contents: {
          ...state.contents,
          [id]: content,
        },
      };
    });

    return id;
  },
  removeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((win) => win.id !== id),
      contents: Object.fromEntries(
        Object.entries(state.contents).filter(([key]) => key !== id)
      ),
    })),
  bringToFront: (id) =>
    set((state) => {
      const z = nextTopZ(state.windows);
      return {
        windows: state.windows.map((w) => (w.id === id ? { ...w, z } : w)),
      };
    }),
  moveWindow: (id, x, y) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
    })),
}));
