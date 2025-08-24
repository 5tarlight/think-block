import { create } from "zustand";

export interface GPUState {
  isAvailable: boolean;
  current: string;
  setCurrent: (gpu: string) => void;
  setAvailability: (available: boolean) => void;
}

export const useGPUStore = create<GPUState>((set) => ({
  isAvailable: false,
  current: "",
  setCurrent: (gpu) => set({ current: gpu }),
  setAvailability: (available) => set({ isAvailable: available }),
}));
