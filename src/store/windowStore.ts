import { create } from "zustand";
import { uid } from "./graphics";

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
  addWindow: (win: { title: string }) => void;
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
  addWindow: (win) =>
    set((state) => {
      const z = nextTopZ(state.windows);

      return {
        windows: [
          ...state.windows,
          {
            ...win,
            id: uid("win-"),
            x: 0,
            y: 0,
            width: 300,
            height: 200,
            z,
          },
        ],
      };
    }),
  removeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((win) => win.id !== id),
    })),
  bringToFront: (id) =>
    set((state) => {
      const z = nextTopZ(state.windows);
      return {
        windows: state.windows.map((w) => (w.id === id ? { ...w, z } : w)),
      };
    }),
}));
