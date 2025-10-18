import type { ContextMenuItem } from "../components/canvas/context-menu";
import AdditionNode from "./node-impl/arithmetic/AdditionNode";
import CsvNode from "./node-impl/data/CsvNode";
import MultiplicationNode from "./node-impl/arithmetic/MultiplicationNode";
import type NodeImpl from "./node-impl/NodeImpl";
import NumberNode from "./node-impl/data/NumberNode";
import OutputNode from "./node-impl/OutputNode";
import MaximumNode from "./node-impl/statistics/MaximumNode";

export type NodeType = "number" | "add" | "multiply" | "output" | "csv" | "max";
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
    label: "statistics",
    isSubMenu: true,
    sub: [
      {
        label: "maximum",
        type: "max",
        keywords: ["max", "최대값"],
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
    return new AdditionNode(nodeId);
  } else if (type === "multiply") {
    return new MultiplicationNode(nodeId);
  } else if (type === "output") {
    return new OutputNode(nodeId);
  } else if (type === "csv") {
    return new CsvNode(nodeId);
  } else if (type === "max") {
    return new MaximumNode(nodeId);
  }

  return null;
}
