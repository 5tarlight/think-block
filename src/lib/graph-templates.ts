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
  id: "regression" | "classification" | "statistics";
  title: string;
  description: string;
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}

export const graphTemplates: GraphTemplate[] = [
  {
    id: "regression",
    title: "Build your first nn.Module",
    description: "Linear, MSELoss, Adam, Train을 조합해 회귀 모델을 학습합니다.",
    nodes: [
      { key: "linear", type: "linear", pos: { x: 40, y: 40 } },
      { key: "sequential", type: "sequential", pos: { x: 350, y: 40 } },
      { key: "criterion", type: "mse loss", pos: { x: 40, y: 210 } },
      { key: "optimizer", type: "adam", pos: { x: 350, y: 210 } },
      { key: "data", type: "linear data generator", pos: { x: 40, y: 390 } },
      { key: "split", type: "train test split", pos: { x: 350, y: 360 } },
      { key: "train", type: "train", pos: { x: 680, y: 210 } },
      { key: "predict", type: "predict", pos: { x: 990, y: 360 } },
      { key: "mse", type: "mean squared error", pos: { x: 990, y: 540 } },
    ],
    edges: [
      { from: { node: "linear", port: "module" }, to: { node: "sequential", port: "modules" } },
      { from: { node: "data", port: "features" }, to: { node: "split", port: "x" } },
      { from: { node: "data", port: "labels" }, to: { node: "split", port: "y" } },
      { from: { node: "sequential", port: "model" }, to: { node: "train", port: "model" } },
      { from: { node: "split", port: "train_x" }, to: { node: "train", port: "train_x" } },
      { from: { node: "split", port: "train_y" }, to: { node: "train", port: "train_y" } },
      { from: { node: "criterion", port: "criterion" }, to: { node: "train", port: "criterion" } },
      { from: { node: "optimizer", port: "optimizer" }, to: { node: "train", port: "optimizer" } },
      { from: { node: "train", port: "trained_model" }, to: { node: "predict", port: "model" } },
      { from: { node: "split", port: "test_x" }, to: { node: "predict", port: "features" } },
      { from: { node: "predict", port: "predictions" }, to: { node: "mse", port: "predictions" } },
      { from: { node: "split", port: "test_y" }, to: { node: "mse", port: "actual" } },
    ],
  },
  {
    id: "classification",
    title: "Classify the Iris dataset",
    description: "Iris, Softmax, CrossEntropyLoss, Accuracy로 다중 분류를 학습합니다.",
    nodes: [
      { key: "in-features", type: "number", pos: { x: 20, y: 20 }, value: 4 },
      { key: "out-features", type: "number", pos: { x: 20, y: 95 }, value: 3 },
      { key: "criterion", type: "cross entropy loss", pos: { x: 20, y: 210 } },
      { key: "optimizer", type: "adam", pos: { x: 20, y: 340 } },
      { key: "data", type: "iris dataset", pos: { x: 20, y: 500 } },
      { key: "linear", type: "linear", pos: { x: 315, y: 20 } },
      { key: "normalize", type: "normalize", pos: { x: 315, y: 460 } },
      { key: "softmax", type: "softmax", pos: { x: 625, y: 20 } },
      { key: "sequential", type: "sequential", pos: { x: 625, y: 160 } },
      { key: "split", type: "train test split", pos: { x: 625, y: 400 } },
      { key: "train", type: "train", pos: { x: 935, y: 180 } },
      { key: "predict", type: "predict", pos: { x: 1245, y: 310 } },
      { key: "accuracy", type: "accuracy", pos: { x: 1245, y: 500 } },
      { key: "f1", type: "f1 score", pos: { x: 1245, y: 660 } },
    ],
    edges: [
      { from: { node: "in-features", port: "value" }, to: { node: "linear", port: "in_features" } },
      { from: { node: "out-features", port: "value" }, to: { node: "linear", port: "out_features" } },
      { from: { node: "linear", port: "module" }, to: { node: "softmax", port: "module" } },
      { from: { node: "softmax", port: "module" }, to: { node: "sequential", port: "modules" } },
      { from: { node: "data", port: "features" }, to: { node: "normalize", port: "data" } },
      { from: { node: "normalize", port: "normalized" }, to: { node: "split", port: "x" } },
      { from: { node: "data", port: "targets" }, to: { node: "split", port: "y" } },
      { from: { node: "sequential", port: "model" }, to: { node: "train", port: "model" } },
      { from: { node: "split", port: "train_x" }, to: { node: "train", port: "train_x" } },
      { from: { node: "split", port: "train_y" }, to: { node: "train", port: "train_y" } },
      { from: { node: "criterion", port: "criterion" }, to: { node: "train", port: "criterion" } },
      { from: { node: "optimizer", port: "optimizer" }, to: { node: "train", port: "optimizer" } },
      { from: { node: "train", port: "trained_model" }, to: { node: "predict", port: "model" } },
      { from: { node: "split", port: "test_x" }, to: { node: "predict", port: "features" } },
      { from: { node: "predict", port: "predictions" }, to: { node: "accuracy", port: "predictions" } },
      { from: { node: "split", port: "test_y" }, to: { node: "accuracy", port: "targets" } },
      { from: { node: "predict", port: "predictions" }, to: { node: "f1", port: "predictions" } },
      { from: { node: "split", port: "test_y" }, to: { node: "f1", port: "targets" } },
    ],
  },
  {
    id: "statistics",
    title: "Tensor statistics",
    description: "mean, median, std를 연결해 Tensor의 분포를 읽습니다.",
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
