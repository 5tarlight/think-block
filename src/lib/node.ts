import type { ContextMenuItem } from "../components/canvas/context-menu";
import AddictionNode from "./node-impl/AddictionNode";
import CsvNode from "./node-impl/CsvNode";
import MultiplicationNode from "./node-impl/MultiplicationNode";
import type NodeImpl from "./node-impl/NodeImpl";
import NumberNode from "./node-impl/NumberNode";
import OutputNode from "./node-impl/OutputNode";

export type NodeType = "number" | "add" | "multiply" | "output" | "csv";
export type NodeSize = "full" | "small" | "input";

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

export function getNodeImpl(nodeId: string, type: NodeType): NodeImpl | null {
  if (type === "number") {
    return new NumberNode(nodeId);
  } else if (type === "add") {
    return new AddictionNode(nodeId);
  } else if (type === "multiply") {
    return new MultiplicationNode(nodeId);
  } else if (type === "output") {
    return new OutputNode(nodeId);
  } else if (type === "csv") {
    return new CsvNode(nodeId);
  }

  return null;
}
