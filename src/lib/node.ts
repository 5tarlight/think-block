import type { ContextMenuItem } from "../components/canvas/context-menu";
import AdditionNode from "./node-impl/arithmetic/AdditionNode";
import MultiplicationNode from "./node-impl/arithmetic/MultiplicationNode";
import CsvNode from "./node-impl/data/CsvNode";
import LinearDataGeneratorNode from "./node-impl/data/LinearDataGeneratorNode";
import NumberNode from "./node-impl/data/NumberNode";
import MeanSquaredErrorNode from "./node-impl/evaluation/MeanSquaredErrorNode";
import LinearRegressionNode from "./node-impl/model/LinearRegressionNode";
import PredictNode from "./node-impl/model/PredictNode";
import type NodeImpl from "./node-impl/NodeImpl";
import NormalizeNode from "./node-impl/preprocessing/NormalizeNode";
import TrainTestSplitNode from "./node-impl/preprocessing/TrainTestSplitNode";
import OutputNode from "./node-impl/OutputNode";
import ArgmaxNode from "./node-impl/statistics/ArgmaxNode";
import ArgminNode from "./node-impl/statistics/ArgminNode";
import AverageNode from "./node-impl/statistics/AverageNode";
import MaximumNode from "./node-impl/statistics/MaximumNode";
import MedianNode from "./node-impl/statistics/MedianNode";
import MinimumNode from "./node-impl/statistics/MinimumNode";
import StddevNode from "./node-impl/statistics/StddevNode";
import SumNode from "./node-impl/statistics/SumNode";
import VariationNode from "./node-impl/statistics/VariationNode";

export type NodeType =
  | "number"
  | "csv"
  | "linear data generator"
  | "normalize"
  | "train test split"
  | "add"
  | "multiply"
  | "linear regression"
  | "predict"
  | "mean squared error"
  | "max"
  | "min"
  | "argmax"
  | "argmin"
  | "avg"
  | "median"
  | "variation"
  | "stddev"
  | "sum"
  | "output";

export type NodeSize = "full" | "small" | "input";
export type NodeCategory =
  | "data"
  | "preprocessing"
  | "arithmetic"
  | "statistics"
  | "model"
  | "evaluation"
  | "output";

export interface NodeDefinition {
  type: NodeType;
  label: string;
  category: NodeCategory;
  description: string;
  keywords: string[];
}

export const categoryLabels: Record<NodeCategory, string> = {
  data: "데이터",
  preprocessing: "전처리",
  arithmetic: "연산",
  statistics: "통계",
  model: "모델",
  evaluation: "평가",
  output: "결과",
};

export const nodeCatalog: NodeDefinition[] = [
  { type: "number", label: "숫자", category: "data", description: "하나의 숫자를 다른 블록에 전달합니다.", keywords: ["number", "value", "숫자", "상수"] },
  { type: "csv", label: "CSV 데이터", category: "data", description: "업로드한 표 데이터를 그래프로 가져옵니다.", keywords: ["csv", "table", "파일", "표"] },
  { type: "linear data generator", label: "선형 샘플 데이터", category: "data", description: "직선에 작은 잡음을 더한 학습 데이터를 만듭니다.", keywords: ["linear", "generator", "선형", "샘플", "회귀"] },
  { type: "normalize", label: "정규화", category: "preprocessing", description: "데이터의 평균을 0, 표준편차를 1에 가깝게 맞춥니다.", keywords: ["normalize", "scale", "정규화", "스케일"] },
  { type: "train test split", label: "학습·테스트 분리", category: "preprocessing", description: "데이터를 학습용 80%와 평가용 20%로 나눕니다.", keywords: ["split", "train", "test", "분리", "검증"] },
  { type: "add", label: "더하기", category: "arithmetic", description: "두 숫자 또는 텐서를 더합니다.", keywords: ["add", "plus", "더하기", "합"] },
  { type: "multiply", label: "곱하기", category: "arithmetic", description: "두 숫자 또는 텐서를 곱합니다.", keywords: ["multiply", "product", "곱하기"] },
  { type: "linear regression", label: "선형 회귀 학습", category: "model", description: "특성과 정답 사이의 직선 관계를 학습합니다.", keywords: ["linear", "regression", "train", "회귀", "학습"] },
  { type: "predict", label: "예측", category: "model", description: "학습된 모델에 새 특성을 넣어 값을 예측합니다.", keywords: ["predict", "inference", "예측", "추론"] },
  { type: "mean squared error", label: "평균제곱오차", category: "evaluation", description: "예측과 실제 값의 차이를 제곱해 평균냅니다.", keywords: ["mse", "loss", "error", "오차", "평가"] },
  { type: "sum", label: "합계", category: "statistics", description: "모든 값의 합을 구합니다.", keywords: ["sum", "합계"] },
  { type: "avg", label: "평균", category: "statistics", description: "모든 값의 산술 평균을 구합니다.", keywords: ["average", "mean", "평균"] },
  { type: "max", label: "최댓값", category: "statistics", description: "가장 큰 값을 찾습니다.", keywords: ["maximum", "max", "최댓값"] },
  { type: "min", label: "최솟값", category: "statistics", description: "가장 작은 값을 찾습니다.", keywords: ["minimum", "min", "최솟값"] },
  { type: "argmax", label: "최댓값 위치", category: "statistics", description: "가장 큰 값의 위치를 찾습니다.", keywords: ["argmax", "최대", "위치"] },
  { type: "argmin", label: "최솟값 위치", category: "statistics", description: "가장 작은 값의 위치를 찾습니다.", keywords: ["argmin", "최소", "위치"] },
  { type: "median", label: "중앙값", category: "statistics", description: "정렬했을 때 가운데에 있는 값을 구합니다.", keywords: ["median", "중앙값"] },
  { type: "variation", label: "분산", category: "statistics", description: "값이 평균에서 얼마나 흩어졌는지 구합니다.", keywords: ["variance", "variation", "분산"] },
  { type: "stddev", label: "표준편차", category: "statistics", description: "흩어진 정도를 원래 값의 단위로 나타냅니다.", keywords: ["stddev", "standard deviation", "표준편차"] },
  { type: "output", label: "결과 보기", category: "output", description: "계산 결과를 숫자나 표로 확인합니다.", keywords: ["output", "result", "print", "결과", "출력"] },
];

const categoryOrder: NodeCategory[] = [
  "data",
  "preprocessing",
  "model",
  "evaluation",
  "statistics",
  "arithmetic",
  "output",
];

export const contextMenuItems: ContextMenuItem[] = categoryOrder
  .map((category) => ({
    label: categoryLabels[category],
    isSubMenu: true,
    sub: nodeCatalog
      .filter((item) => item.category === category)
      .map((item) => ({
        label: item.label,
        type: item.type,
        keywords: item.keywords,
      })),
  }))
  .filter((item) => item.sub.length > 0);

export function getNodeDefinition(type: NodeType): NodeDefinition {
  const definition = nodeCatalog.find((item) => item.type === type);
  if (!definition) throw new Error(`Unknown node type: ${type}`);
  return definition;
}

export function getNodeCategory(type: NodeType): NodeCategory {
  return getNodeDefinition(type).category;
}

export function getNodeImpl(nodeId: string, type: NodeType): NodeImpl | null {
  switch (type) {
    case "number": return new NumberNode(nodeId);
    case "add": return new AdditionNode(nodeId);
    case "multiply": return new MultiplicationNode(nodeId);
    case "output": return new OutputNode(nodeId);
    case "csv": return new CsvNode(nodeId);
    case "linear data generator": return new LinearDataGeneratorNode(nodeId);
    case "normalize": return new NormalizeNode(nodeId);
    case "train test split": return new TrainTestSplitNode(nodeId);
    case "linear regression": return new LinearRegressionNode(nodeId);
    case "predict": return new PredictNode(nodeId);
    case "mean squared error": return new MeanSquaredErrorNode(nodeId);
    case "max": return new MaximumNode(nodeId);
    case "min": return new MinimumNode(nodeId);
    case "argmax": return new ArgmaxNode(nodeId);
    case "argmin": return new ArgminNode(nodeId);
    case "avg": return new AverageNode(nodeId);
    case "median": return new MedianNode(nodeId);
    case "variation": return new VariationNode(nodeId);
    case "stddev": return new StddevNode(nodeId);
    case "sum": return new SumNode(nodeId);
    default: return null;
  }
}
