import type { NodeType } from "./node";
import type { Vec2 } from "../store/graphics";

export interface TemplateNode {
  key: string;
  type: NodeType;
  pos: Vec2;
  value?: number;
}

export interface TemplateEdge {
  from: { node: string; port: string };
  to: { node: string; port: string };
}

export interface GraphTemplate {
  id: "regression" | "statistics";
  title: string;
  description: string;
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}

export const graphTemplates: GraphTemplate[] = [
  {
    id: "regression",
    title: "첫 선형 회귀",
    description: "샘플을 나누고, 직선을 학습하고, MSE로 결과를 평가합니다.",
    nodes: [
      { key: "data", type: "linear data generator", pos: { x: 40, y: 220 } },
      { key: "split", type: "train test split", pos: { x: 350, y: 190 } },
      { key: "train", type: "linear regression", pos: { x: 680, y: 40 } },
      { key: "predict", type: "predict", pos: { x: 680, y: 330 } },
      { key: "mse", type: "mean squared error", pos: { x: 1010, y: 330 } },
      { key: "score", type: "output", pos: { x: 1010, y: 500 } },
    ],
    edges: [
      { from: { node: "data", port: "features" }, to: { node: "split", port: "features" } },
      { from: { node: "data", port: "labels" }, to: { node: "split", port: "labels" } },
      { from: { node: "split", port: "train features" }, to: { node: "train", port: "features" } },
      { from: { node: "split", port: "train labels" }, to: { node: "train", port: "labels" } },
      { from: { node: "train", port: "model" }, to: { node: "predict", port: "model" } },
      { from: { node: "split", port: "test features" }, to: { node: "predict", port: "features" } },
      { from: { node: "predict", port: "predictions" }, to: { node: "mse", port: "predictions" } },
      { from: { node: "split", port: "test labels" }, to: { node: "mse", port: "actual" } },
      { from: { node: "mse", port: "mse" }, to: { node: "score", port: "in" } },
    ],
  },
  {
    id: "statistics",
    title: "데이터의 중심 찾기",
    description: "같은 데이터에서 평균, 중앙값, 표준편차를 비교합니다.",
    nodes: [
      { key: "data", type: "linear data generator", pos: { x: 80, y: 220 } },
      { key: "avg", type: "avg", pos: { x: 430, y: 80 } },
      { key: "median", type: "median", pos: { x: 430, y: 230 } },
      { key: "std", type: "stddev", pos: { x: 430, y: 380 } },
      { key: "avg-output", type: "output", pos: { x: 760, y: 80 } },
      { key: "median-output", type: "output", pos: { x: 760, y: 230 } },
      { key: "std-output", type: "output", pos: { x: 760, y: 380 } },
    ],
    edges: [
      { from: { node: "data", port: "labels" }, to: { node: "avg", port: "input" } },
      { from: { node: "data", port: "labels" }, to: { node: "median", port: "input" } },
      { from: { node: "data", port: "labels" }, to: { node: "std", port: "input" } },
      { from: { node: "avg", port: "avg" }, to: { node: "avg-output", port: "in" } },
      { from: { node: "median", port: "median" }, to: { node: "median-output", port: "in" } },
      { from: { node: "std", port: "stddev" }, to: { node: "std-output", port: "in" } },
    ],
  },
];

export function getGraphTemplate(id: GraphTemplate["id"]): GraphTemplate {
  const template = graphTemplates.find((item) => item.id === id);
  if (!template) throw new Error(`Unknown graph template: ${id}`);
  return template;
}
