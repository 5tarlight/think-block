import { create } from "zustand";
import type { FileStatus } from "../components/sidebar/file-item";

export interface FileDesc {
  key: string;
  name: string;
  size: number;
  raw: File;
  status: FileStatus;
  progress: number;
  contentText?: string;
  previewURL?: string;
}

interface FileState {
  files: { file: FileDesc; isInput: boolean }[];
  addFile: (file: FileDesc, isInput?: boolean) => void;
  upsertFile: (file: FileDesc, isInput?: boolean) => void;
  removeFile: (key: string) => void;
  getFile: (key: string) => FileDesc | undefined;
  insertFiles: (picked: FileList | File[], isInput?: boolean) => FileDesc[];
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  addFile: (file: FileDesc, isInput: boolean = true) => {
    set((state) => ({
      files: [...state.files, { file, isInput }],
    }));
  },
  upsertFile: (next: FileDesc, isInput: boolean = true) => {
    set((state) => {
      const idx = state.files.findIndex((f) => f.file.key === next.key);
      if (idx === -1) {
        return { files: [...state.files, { file: next, isInput }] };
      }

      const copy = state.files.slice();
      copy[idx] = { file: next, isInput };
      return { files: copy };
    });
  },
  removeFile: (key: string) => {
    set((state) => ({
      files: state.files.filter((f) => f.file.key !== key),
    }));
  },
  getFile: (key: string) => {
    return get().files.find((f) => f.file.key === key)?.file;
  },
  insertFiles: (
    picked: FileList | File[],
    isInput: boolean = true
  ): FileDesc[] => {
    const arr = Array.from(picked);
    if (arr.length === 0) return [];

    const items: FileDesc[] = arr.map((file) => {
      const ui: FileDesc = {
        key: `${file.name}-${file.lastModified}-${file.size}`,
        name: file.name,
        size: file.size,
        raw: file,
        status: "pending",
        progress: 0,
      };
      return ui;
    });

    items.forEach((f) => get().addFile(f, isInput));

    return items;
  },
}));
