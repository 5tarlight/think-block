import type { ContextMenuItem } from "../components/canvas/context-menu";
import AdditionNode from "./node-impl/arithmetic/AdditionNode";
import MultiplicationNode from "./node-impl/arithmetic/MultiplicationNode";
import CsvNode from "./node-impl/data/CsvNode";
import BenchmarkDatasetNode from "./node-impl/data/BenchmarkDatasetNode";
import LinearDataGeneratorNode from "./node-impl/data/LinearDataGeneratorNode";
import NumberNode from "./node-impl/data/NumberNode";
import SyntheticClassificationNode from "./node-impl/data/SyntheticClassificationNode";
import ClassificationMetricNode from "./node-impl/evaluation/ClassificationMetricNode";
import ConfusionMatrixNode from "./node-impl/evaluation/ConfusionMatrixNode";
import MeanSquaredErrorNode from "./node-impl/evaluation/MeanSquaredErrorNode";
import RegressionMetricNode from "./node-impl/evaluation/RegressionMetricNode";
import DropoutNode from "./node-impl/model/DropoutNode";
import LinearNode from "./node-impl/model/LinearNode";
import LinearRegressionNode from "./node-impl/model/LinearRegressionNode";
import PredictNode from "./node-impl/model/PredictNode";
import ReLUNode from "./node-impl/model/ReLUNode";
import SequentialNode from "./node-impl/model/SequentialNode";
import SigmoidNode from "./node-impl/model/SigmoidNode";
import SoftmaxNode from "./node-impl/model/SoftmaxNode";
import TanhNode from "./node-impl/model/TanhNode";
import type NodeImpl from "./node-impl/NodeImpl";
import NormalizeNode from "./node-impl/preprocessing/NormalizeNode";
import MinMaxScaleNode from "./node-impl/preprocessing/MinMaxScaleNode";
import OneHotNode from "./node-impl/preprocessing/OneHotNode";
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
import AdamNode from "./node-impl/training/AdamNode";
import BCELossNode from "./node-impl/training/BCELossNode";
import CrossEntropyLossNode from "./node-impl/training/CrossEntropyLossNode";
import L1LossNode from "./node-impl/training/L1LossNode";
import MSELossNode from "./node-impl/training/MSELossNode";
import SGDNode from "./node-impl/training/SGDNode";
import TrainNode from "./node-impl/training/TrainNode";

export type NodeType =
  | "number"
  | "csv"
  | "linear data generator"
  | "iris dataset"
  | "wine dataset"
  | "breast cancer dataset"
  | "make moons"
  | "make blobs"
  | "normalize"
  | "min max scale"
  | "one hot"
  | "train test split"
  | "linear"
  | "relu"
  | "sigmoid"
  | "softmax"
  | "tanh"
  | "dropout"
  | "sequential"
  | "mse loss"
  | "bce loss"
  | "cross entropy loss"
  | "l1 loss"
  | "adam"
  | "sgd"
  | "train"
  | "predict"
  | "mean squared error"
  | "accuracy"
  | "precision"
  | "recall"
  | "f1 score"
  | "confusion matrix"
  | "mean absolute error"
  | "root mean squared error"
  | "r2 score"
  | "add"
  | "multiply"
  | "max"
  | "min"
  | "argmax"
  | "argmin"
  | "avg"
  | "median"
  | "variation"
  | "stddev"
  | "sum"
  | "output"
  | "linear regression";

export type NodeSize = "full" | "small" | "input";
export type NodeCategory =
  | "data"
  | "datasets"
  | "tensor"
  | "modules"
  | "loss"
  | "optimizers"
  | "training"
  | "metrics"
  | "statistics"
  | "math"
  | "output"
  | "legacy";

export interface NodeDefinition {
  type: NodeType;
  label: string;
  signature: string;
  category: NodeCategory;
  description: string;
  keywords: string[];
  hidden?: boolean;
}

export const categoryLabels: Record<NodeCategory, string> = {
  data: "Data",
  datasets: "Datasets",
  tensor: "Tensor ops",
  modules: "nn.Modules",
  loss: "Loss functions",
  optimizers: "torch.optim",
  training: "Training",
  metrics: "Metrics",
  statistics: "Statistics",
  math: "Math",
  output: "Output",
  legacy: "Legacy",
};

export const categoryOrder: NodeCategory[] = [
  "data",
  "datasets",
  "tensor",
  "modules",
  "loss",
  "optimizers",
  "training",
  "metrics",
  "statistics",
  "math",
  "output",
];

export const nodeCatalog: NodeDefinition[] = [
  { type: "number", label: "Scalar", signature: "torch.tensor(value)", category: "data", description: "하나의 숫자 값을 만듭니다.", keywords: ["number", "scalar", "숫자", "상수"] },
  { type: "csv", label: "CSV", signature: "Dataset from CSV", category: "data", description: "업로드한 CSV를 Dataset으로 읽습니다.", keywords: ["csv", "dataset", "파일", "표"] },
  { type: "linear data generator", label: "make_regression", signature: "make_regression(n, noise)", category: "data", description: "회귀 학습용 x와 y 샘플을 만듭니다.", keywords: ["linear", "generator", "sample", "샘플", "회귀"] },
  { type: "iris dataset", label: "Iris", signature: "datasets.Iris()", category: "datasets", description: "150개 꽃, 4개 특성, 3개 class의 고전 분류 데이터입니다.", keywords: ["uci", "flower", "classification", "붓꽃", "분류"] },
  { type: "wine dataset", label: "Wine", signature: "datasets.Wine()", category: "datasets", description: "178개 와인, 13개 화학 특성, 3개 class 데이터입니다.", keywords: ["uci", "chemistry", "classification", "와인", "분류"] },
  { type: "breast cancer dataset", label: "BreastCancer (4F)", signature: "datasets.BreastCancer(features=4)", category: "datasets", description: "UCI 진단 데이터의 대표 4개 특성으로 구성한 이진 분류셋입니다.", keywords: ["uci", "binary", "classification", "cancer", "의료", "분류"] },
  { type: "make moons", label: "make_moons", signature: "make_moons(n, noise, seed)", category: "datasets", description: "비선형 결정경계를 연습하는 두 개의 반달 데이터입니다.", keywords: ["sklearn", "nonlinear", "binary", "classification", "반달"] },
  { type: "make blobs", label: "make_blobs", signature: "make_blobs(n, noise, seed)", category: "datasets", description: "세 class가 군집을 이루는 분류 샘플을 만듭니다.", keywords: ["sklearn", "cluster", "multiclass", "classification", "군집"] },

  { type: "normalize", label: "standardize", signature: "(x - mean) / std", category: "tensor", description: "텐서의 평균을 0, 표준편차를 1로 맞춥니다.", keywords: ["normalize", "scale", "정규화", "standardize"] },
  { type: "min max scale", label: "MinMaxScaler", signature: "min_max_scale(x)", category: "tensor", description: "특성별 값을 0과 1 사이로 변환합니다.", keywords: ["normalize", "scale", "minmax", "정규화"] },
  { type: "one hot", label: "one_hot", signature: "F.one_hot(labels, num_classes)", category: "tensor", description: "class index를 one-hot target tensor로 바꿉니다.", keywords: ["encode", "categorical", "인코딩", "분류"] },
  { type: "train test split", label: "train_test_split", signature: "train_test_split(x, y, test_ratio, seed)", category: "tensor", description: "Dataset을 섞은 뒤 train과 test로 재현 가능하게 나눕니다.", keywords: ["split", "shuffle", "seed", "train", "test", "분리", "검증"] },

  { type: "linear", label: "Linear", signature: "nn.Linear(in_features, out_features)", category: "modules", description: "입력에 학습 가능한 선형 변환을 적용합니다.", keywords: ["dense", "fully connected", "fc", "선형", "레이어"] },
  { type: "relu", label: "ReLU", signature: "nn.ReLU()", category: "modules", description: "음수는 0으로 만들고 양수는 유지합니다.", keywords: ["activation", "활성화"] },
  { type: "sigmoid", label: "Sigmoid", signature: "nn.Sigmoid()", category: "modules", description: "출력을 0과 1 사이로 압축합니다.", keywords: ["activation", "classification", "활성화", "분류"] },
  { type: "softmax", label: "Softmax", signature: "nn.Softmax(dim=-1)", category: "modules", description: "여러 class score를 합이 1인 확률로 바꿉니다.", keywords: ["activation", "multiclass", "probability", "분류", "확률"] },
  { type: "tanh", label: "Tanh", signature: "nn.Tanh()", category: "modules", description: "출력을 -1과 1 사이로 압축합니다.", keywords: ["activation", "nonlinear", "활성화"] },
  { type: "dropout", label: "Dropout", signature: "nn.Dropout(p=0.5)", category: "modules", description: "학습 중 일부 연결을 꺼 과적합을 줄입니다.", keywords: ["regularization", "overfit", "과적합"] },
  { type: "sequential", label: "Sequential", signature: "nn.Sequential(*modules)", category: "modules", description: "연결한 레이어를 하나의 model로 묶습니다.", keywords: ["model", "container", "모델", "컨테이너"] },

  { type: "mse loss", label: "MSELoss", signature: "nn.MSELoss()", category: "loss", description: "회귀 예측과 target의 평균제곱오차를 계산합니다.", keywords: ["mse", "loss", "regression", "손실", "회귀"] },
  { type: "bce loss", label: "BCELoss", signature: "nn.BCELoss()", category: "loss", description: "이진 분류 확률과 target의 손실을 계산합니다.", keywords: ["bce", "binary", "classification", "이진 분류"] },
  { type: "cross entropy loss", label: "CrossEntropyLoss", signature: "nn.CrossEntropyLoss()", category: "loss", description: "다중 class 확률과 one-hot target의 손실을 계산합니다.", keywords: ["cross entropy", "categorical", "multiclass", "분류"] },
  { type: "l1 loss", label: "L1Loss", signature: "nn.L1Loss()", category: "loss", description: "예측과 target 차이의 절댓값 평균을 계산합니다.", keywords: ["mae", "absolute", "regression", "회귀"] },

  { type: "adam", label: "Adam", signature: "optim.Adam(lr=0.03)", category: "optimizers", description: "적응형 학습률로 파라미터를 업데이트합니다.", keywords: ["optimizer", "adam", "최적화"] },
  { type: "sgd", label: "SGD", signature: "optim.SGD(lr=0.01)", category: "optimizers", description: "확률적 경사하강법으로 파라미터를 업데이트합니다.", keywords: ["optimizer", "gradient", "최적화", "경사하강"] },

  { type: "train", label: "Train", signature: "train(model, x, y, ...)", category: "training", description: "model, criterion, optimizer를 사용해 학습 루프를 실행합니다.", keywords: ["fit", "epoch", "학습", "training loop"] },
  { type: "predict", label: "Forward", signature: "model(x)", category: "training", description: "학습된 model에 tensor를 통과시켜 예측합니다.", keywords: ["predict", "inference", "forward", "예측", "추론"] },

  { type: "mean squared error", label: "MSE", signature: "mse(prediction, target)", category: "metrics", description: "test 예측과 실제 target의 차이를 평가합니다.", keywords: ["mse", "metric", "error", "오차", "평가"] },
  { type: "mean absolute error", label: "MAE", signature: "mae(predictions, targets)", category: "metrics", description: "회귀 오차 절댓값의 평균을 계산합니다.", keywords: ["absolute", "regression", "오차", "회귀"] },
  { type: "root mean squared error", label: "RMSE", signature: "rmse(predictions, targets)", category: "metrics", description: "MSE에 제곱근을 적용해 target과 같은 단위로 봅니다.", keywords: ["regression", "root", "오차", "회귀"] },
  { type: "r2 score", label: "R²", signature: "r2_score(predictions, targets)", category: "metrics", description: "회귀 모델이 target 분산을 설명하는 비율을 계산합니다.", keywords: ["r2", "coefficient", "regression", "결정계수", "회귀"] },
  { type: "accuracy", label: "Accuracy", signature: "accuracy(predictions, targets)", category: "metrics", description: "전체 sample 중 class를 맞힌 비율을 계산합니다.", keywords: ["classification", "correct", "정확도", "분류"] },
  { type: "precision", label: "Precision", signature: "precision(predictions, targets, average='macro')", category: "metrics", description: "예측한 class가 맞은 정도를 macro 평균으로 계산합니다.", keywords: ["classification", "macro", "정밀도", "분류"] },
  { type: "recall", label: "Recall", signature: "recall(predictions, targets, average='macro')", category: "metrics", description: "실제 class를 찾아낸 정도를 macro 평균으로 계산합니다.", keywords: ["classification", "macro", "재현율", "분류"] },
  { type: "f1 score", label: "F1Score", signature: "f1_score(predictions, targets, average='macro')", category: "metrics", description: "Precision과 Recall의 조화평균을 계산합니다.", keywords: ["classification", "macro", "f1", "분류"] },
  { type: "confusion matrix", label: "ConfusionMatrix", signature: "confusion_matrix(predictions, targets)", category: "metrics", description: "실제 class와 예측 class의 교차표를 만듭니다.", keywords: ["classification", "matrix", "혼동행렬", "분류"] },

  { type: "sum", label: "sum", signature: "torch.sum(input)", category: "statistics", description: "텐서의 모든 값을 더합니다.", keywords: ["합계"] },
  { type: "avg", label: "mean", signature: "torch.mean(input)", category: "statistics", description: "텐서 값의 산술 평균을 구합니다.", keywords: ["average", "평균"] },
  { type: "max", label: "max", signature: "torch.max(input)", category: "statistics", description: "텐서에서 가장 큰 값을 구합니다.", keywords: ["maximum", "최댓값"] },
  { type: "min", label: "min", signature: "torch.min(input)", category: "statistics", description: "텐서에서 가장 작은 값을 구합니다.", keywords: ["minimum", "최솟값"] },
  { type: "argmax", label: "argmax", signature: "torch.argmax(input)", category: "statistics", description: "최댓값이 있는 index를 반환합니다.", keywords: ["최대", "인덱스", "index"] },
  { type: "argmin", label: "argmin", signature: "torch.argmin(input)", category: "statistics", description: "최솟값이 있는 index를 반환합니다.", keywords: ["최소", "인덱스", "index"] },
  { type: "median", label: "median", signature: "torch.median(input)", category: "statistics", description: "정렬했을 때 가운데 값을 구합니다.", keywords: ["중앙값"] },
  { type: "variation", label: "var", signature: "torch.var(input)", category: "statistics", description: "텐서 값의 분산을 구합니다.", keywords: ["variance", "분산"] },
  { type: "stddev", label: "std", signature: "torch.std(input)", category: "statistics", description: "텐서 값의 표준편차를 구합니다.", keywords: ["stddev", "표준편차"] },

  { type: "add", label: "add", signature: "torch.add(a, b)", category: "math", description: "두 scalar 또는 tensor를 더합니다.", keywords: ["plus", "더하기", "합"] },
  { type: "multiply", label: "mul", signature: "torch.mul(a, b)", category: "math", description: "두 scalar 또는 tensor를 곱합니다.", keywords: ["multiply", "product", "곱하기"] },
  { type: "output", label: "Inspect", signature: "inspect(value)", category: "output", description: "tensor, scalar, model의 내용을 확인합니다.", keywords: ["output", "result", "print", "결과", "출력"] },

  { type: "linear regression", label: "LinearRegression", signature: "legacy.LinearRegression", category: "legacy", description: "이전 프로젝트 호환용 블록입니다.", keywords: [], hidden: true },
];

export const contextMenuItems: ContextMenuItem[] = categoryOrder
  .map((category) => ({
    label: categoryLabels[category],
    isSubMenu: true,
    sub: nodeCatalog
      .filter((item) => item.category === category && !item.hidden)
      .map((item) => ({
        label: item.label,
        type: item.type,
        keywords: [item.signature, ...item.keywords],
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
    case "csv": return new CsvNode(nodeId);
    case "linear data generator": return new LinearDataGeneratorNode(nodeId);
    case "iris dataset": return new BenchmarkDatasetNode(nodeId, type, "iris");
    case "wine dataset": return new BenchmarkDatasetNode(nodeId, type, "wine");
    case "breast cancer dataset": return new BenchmarkDatasetNode(nodeId, type, "breast-cancer");
    case "make moons": return new SyntheticClassificationNode(nodeId, type, "moons");
    case "make blobs": return new SyntheticClassificationNode(nodeId, type, "blobs");
    case "normalize": return new NormalizeNode(nodeId);
    case "min max scale": return new MinMaxScaleNode(nodeId);
    case "one hot": return new OneHotNode(nodeId);
    case "train test split": return new TrainTestSplitNode(nodeId);
    case "linear": return new LinearNode(nodeId);
    case "relu": return new ReLUNode(nodeId);
    case "sigmoid": return new SigmoidNode(nodeId);
    case "softmax": return new SoftmaxNode(nodeId);
    case "tanh": return new TanhNode(nodeId);
    case "dropout": return new DropoutNode(nodeId);
    case "sequential": return new SequentialNode(nodeId);
    case "mse loss": return new MSELossNode(nodeId);
    case "bce loss": return new BCELossNode(nodeId);
    case "cross entropy loss": return new CrossEntropyLossNode(nodeId);
    case "l1 loss": return new L1LossNode(nodeId);
    case "adam": return new AdamNode(nodeId);
    case "sgd": return new SGDNode(nodeId);
    case "train": return new TrainNode(nodeId);
    case "predict": return new PredictNode(nodeId);
    case "mean squared error": return new MeanSquaredErrorNode(nodeId);
    case "mean absolute error": return new RegressionMetricNode(nodeId, type, "mae");
    case "root mean squared error": return new RegressionMetricNode(nodeId, type, "rmse");
    case "r2 score": return new RegressionMetricNode(nodeId, type, "r2");
    case "accuracy": return new ClassificationMetricNode(nodeId, type, "accuracy");
    case "precision": return new ClassificationMetricNode(nodeId, type, "precision");
    case "recall": return new ClassificationMetricNode(nodeId, type, "recall");
    case "f1 score": return new ClassificationMetricNode(nodeId, type, "f1");
    case "confusion matrix": return new ConfusionMatrixNode(nodeId);
    case "add": return new AdditionNode(nodeId);
    case "multiply": return new MultiplicationNode(nodeId);
    case "output": return new OutputNode(nodeId);
    case "linear regression": return new LinearRegressionNode(nodeId);
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
