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
}

function nextTopZ(windows: Win[]) {
  if (windows.length === 0) return BASE_Z;
  const maxZ = Math.max(...windows.map((w) => w.z));
  return Math.max(maxZ + 1, BASE_Z);
}

export const useWinStore = create<WinState>((set) => ({
  windows: [],
  contents: {},
  addWindow: (win, content, width, height) => {
    const id = uid("win");
    set((state) => {
      const z = nextTopZ(state.windows);

      return {
        windows: [
          ...state.windows,
          {
            ...win,
            id,
            x: 0,
            y: 0,
            width: width || 500,
            height: height || 400,
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
}));
