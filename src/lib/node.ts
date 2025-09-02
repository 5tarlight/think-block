import type { ContextMenuItem } from "../components/canvas/context-menu";
import { uid } from "../store/graphics";
import type { Port } from "./node-impl/NodeImpl";

export type NodeType = "number" | "add" | "multiply" | "output" | "csv";

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
        label: "CSV",
        type: "csv",
        keywords: ["data", "입력", "csv"],
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
  inputs: Port[];
  outputs: Port[];
  size: "full" | "small" | "input";
} {
  if (type === "number") {
    return {
      inputs: [],
      outputs: [{ id: uid(), name: "value", kind: "out" }],
      size: "input",
    };
  } else if (type === "csv") {
    return {
      inputs: [],
      outputs: [{ id: uid(), name: "out", kind: "out" }],
      size: "full",
    };
  } else if (type === "output") {
    return {
      inputs: [{ id: uid(), name: "in", kind: "in" }],
      outputs: [],
      size: "full",
    };
  } else if (type === "add") {
    return {
      inputs: [
        { id: uid(), name: "a", kind: "in" },
        { id: uid(), name: "b", kind: "in" },
      ],
      outputs: [{ id: uid(), name: "a + b", kind: "out" }],
      size: "small",
    };
  } else if (type === "multiply") {
    return {
      inputs: [
        { id: uid(), name: "a", kind: "in" },
        { id: uid(), name: "b", kind: "in" },
      ],
      outputs: [{ id: uid(), name: "a * b", kind: "out" }],
      size: "small",
    };
  }

  return {
    inputs: [],
    outputs: [],
    size: "full",
  };
}
