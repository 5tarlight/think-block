import type { ContextMenuItem } from "../components/canvas/context-menu";
import AdditionNode from "./node-impl/arithmetic/AdditionNode";
import CsvNode from "./node-impl/data/CsvNode";
import MultiplicationNode from "./node-impl/arithmetic/MultiplicationNode";
import type NodeImpl from "./node-impl/NodeImpl";
import NumberNode from "./node-impl/data/NumberNode";
import OutputNode from "./node-impl/OutputNode";
import MaximumNode from "./node-impl/statistics/MaximumNode";
import MinimumNode from "./node-impl/statistics/MinimumNode";
import ArgmaxNode from "./node-impl/statistics/ArgmaxNode";
import ArgminNode from "./node-impl/statistics/ArgminNode";
import AverageNode from "./node-impl/statistics/AverageNode";
import MedianNode from "./node-impl/statistics/MedianNode";
import VariationNode from "./node-impl/statistics/VariationNode";
import StddevNode from "./node-impl/statistics/StddevNode";
import SumNode from "./node-impl/statistics/SumNode";

export type NodeType =
  | "number"
  | "add"
  | "multiply"
  | "output"
  | "csv"
  | "max"
  | "min"
  | "argmax"
  | "argmin"
  | "avg"
  | "median"
  | "variation"
  | "stddev"
  | "sum";
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
        label: "sum",
        type: "sum",
        keywords: ["sum", "합계"],
      },
      {
        label: "average",
        type: "avg",
        keywords: ["average", "mean", "평균"],
      },
      {
        label: "maximum",
        type: "max",
        keywords: ["max", "최대값"],
      },
      {
        label: "minimum",
        type: "min",
        keywords: ["min", "최소값"],
      },
      {
        label: "argmax",
        type: "argmax",
        keywords: ["argmax", "최대값 인덱스"],
      },
      {
        label: "argmin",
        type: "argmin",
        keywords: ["argmin", "최소값 인덱스"],
      },

      {
        label: "median",
        type: "median",
        keywords: ["median", "중앙값"],
      },
      {
        label: "variation",
        type: "variation",
        keywords: ["variation", "변동", "분산"],
      },
      {
        label: "standard deviation",
        type: "stddev",
        keywords: ["stddev", "표준편차"],
      },
    ],
  },
  {
    label: "output",
    type: "output",
    keywords: ["print", "result", "출력"],
  },
];

type NodeCategory = "data" | "arithmetic" | "statistics" | "output";

export function getNodeCategory(type: NodeType): NodeCategory {
  if (type === "output") {
    return "output";
  } else if (
    contextMenuItems
      .filter((item) => item.isSubMenu && item.label === "data")[0]
      .sub!.some((sub) => sub.type === type)
  ) {
    return "data";
  } else if (
    contextMenuItems
      .filter((item) => item.isSubMenu && item.label === "arithmetic")[0]
      .sub!.some((sub) => sub.type === type)
  ) {
    return "arithmetic";
  } else if (
    contextMenuItems
      .filter((item) => item.isSubMenu && item.label === "statistics")[0]
      .sub!.some((sub) => sub.type === type)
  ) {
    return "statistics";
  }

  throw new Error(`Unknown node type: ${type}`);
}

export interface NodeColor {
  background: string;
  border: string;
  accent: string;
  text: string;
}

export function getNodeColor(cat: NodeCategory): NodeColor {
  if (cat === "data") {
    return {
      background: "bg-blue-500/20",
      border: "border-blue-500",
      accent: "text-blue-500",
      text: "text-neutral-200",
    };
  } else if (cat === "arithmetic") {
    return {
      background: "bg-green-500/20",
      border: "border-green-500",
      accent: "text-green-500",
      text: "text-neutral-200",
    };
  } else if (cat === "statistics") {
    return {
      background: "bg-purple-500/20",
      border: "border-purple-500",
      accent: "text-purple-500",
      text: "text-neutral-200",
    };
  } else if (cat === "output") {
    return {
      background: "bg-yellow-500/20",
      border: "border-yellow-500",
      accent: "text-yellow-500",
      text: "text-neutral-200",
    };
  }

  return {
    background: "bg-gray-500/20",
    border: "border-gray-500",
    accent: "text-gray-500",
    text: "text-neutral-200",
  };
}

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
  } else if (type === "min") {
    return new MinimumNode(nodeId);
  } else if (type === "argmax") {
    return new ArgmaxNode(nodeId);
  } else if (type === "argmin") {
    return new ArgminNode(nodeId);
  } else if (type === "avg") {
    return new AverageNode(nodeId);
  } else if (type === "median") {
    return new MedianNode(nodeId);
  } else if (type === "variation") {
    return new VariationNode(nodeId);
  } else if (type === "stddev") {
    return new StddevNode(nodeId);
  } else if (type === "sum") {
    return new SumNode(nodeId);
  }

  return null;
}
