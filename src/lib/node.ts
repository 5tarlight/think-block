import type { ContextMenuItem } from "../components/canvas/context-menu";
import { uid } from "../store/graphics";

export type NodeType = "number" | "add" | "multiply" | "output" | "input";

export const contextMenuItems: ContextMenuItem[] = [
  {
    label: "data",
    isSubMenu: true,
    sub: [
      {
        label: "number",
        type: "number",
        keywords: ["num", "value", "숫자", "integer", "float"],
      },
      {
        label: "input",
        type: "input",
        keywords: ["num", "value", "숫자", "number", "integer", "float"],
      },
    ],
  },
  {
    label: "arithmetic",
    isSubMenu: true,
    sub: [
      { label: "add", type: "add", keywords: ["plus", "sum", "더하기"] },
      {
        label: "multiply",
        type: "multiply",
        keywords: ["mul", "product", "곱"],
      },
    ],
  },
  {
    label: "output",
    type: "output",
    keywords: ["print", "result", "출력"],
  },
];

export function getNodeData(type: NodeType): {
  inputs: { id: string; name: string; kind: "in" }[];
  outputs: { id: string; name: string; kind: "out" }[];
} {
  if (type === "number") {
    return {
      inputs: [],
      outputs: [{ id: uid(), name: "value", kind: "out" }],
    };
  } else if (type === "input") {
    return {
      inputs: [],
      outputs: [{ id: uid(), name: "out", kind: "out" }],
    };
  } else if (type === "output") {
    return {
      inputs: [{ id: uid(), name: "in", kind: "in" }],
      outputs: [],
    };
  } else if (type === "add") {
    return {
      inputs: [
        { id: uid(), name: "a", kind: "in" },
        { id: uid(), name: "b", kind: "in" },
      ],
      outputs: [{ id: uid(), name: "sum", kind: "out" }],
    };
  } else if (type === "multiply") {
    return {
      inputs: [
        { id: uid(), name: "a", kind: "in" },
        { id: uid(), name: "b", kind: "in" },
      ],
      outputs: [{ id: uid(), name: "prod", kind: "out" }],
    };
  }

  return {
    inputs: [],
    outputs: [],
  };
}
