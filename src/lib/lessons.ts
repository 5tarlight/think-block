import type { NodeType } from "./node";
import type { GraphTemplate } from "./graph-templates";

export interface LessonCheck {
  id: string;
  label: string;
  nodeTypes?: NodeType[];
  needsSuccess?: boolean;
  needsMse?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  level: string;
  concept: string;
  templateId: GraphTemplate["id"];
  checks: LessonCheck[];
  hint: string;
}

export const lessons: Lesson[] = [
  {
    id: "first-model",
    title: "Build an nn.Module",
    duration: "약 12분",
    level: "입문",
    concept: "PyTorch처럼 Module로 구조를 만들고, criterion으로 오차를 계산하며 optimizer가 parameter를 업데이트합니다.",
    templateId: "regression",
    checks: [
      { id: "data", label: "Dataset을 train/test로 분리하기", nodeTypes: ["linear data generator", "train test split"] },
      { id: "model", label: "Linear를 Sequential model로 묶기", nodeTypes: ["linear", "sequential"] },
      { id: "recipe", label: "MSELoss와 Adam 선택하기", nodeTypes: ["mse loss", "adam"] },
      { id: "train", label: "Train과 Forward 연결하기", nodeTypes: ["train", "predict"] },
      { id: "evaluate", label: "test set의 MSE 확인하기", nodeTypes: ["mean squared error"], needsMse: true },
      { id: "run", label: "training graph 실행하기", needsSuccess: true },
    ],
    hint: "Linear의 in_features와 out_features는 기본값이 1입니다. Scalar 블록을 각 포트에 연결해 크기를 바꿀 수 있어요.",
  },
  {
    id: "read-data",
    title: "Read Tensor statistics",
    duration: "약 8분",
    level: "입문",
    concept: "평균은 중심, 중앙값은 순서상의 가운데, 표준편차는 값이 퍼진 정도를 설명합니다.",
    templateId: "statistics",
    checks: [
      { id: "center", label: "mean과 median을 함께 연결하기", nodeTypes: ["avg", "median"] },
      { id: "spread", label: "std로 분포의 퍼짐 확인하기", nodeTypes: ["stddev"] },
      { id: "run", label: "statistics graph 실행하기", needsSuccess: true },
    ],
    hint: "평균과 중앙값의 차이가 크다면 일부 값이 한쪽으로 치우쳤을 가능성이 있습니다.",
  },
  {
    id: "own-data",
    title: "Train with your Dataset",
    duration: "약 15분",
    level: "도전",
    concept: "좋은 실험은 데이터의 출처와 열의 의미를 먼저 확인하고, 같은 평가 기준으로 모델을 비교합니다.",
    templateId: "regression",
    checks: [
      { id: "csv", label: "CSV Dataset 추가하기", nodeTypes: ["csv"] },
      { id: "normalize", label: "standardize로 입력 tensor 정리하기", nodeTypes: ["normalize"] },
      { id: "output", label: "Inspect로 중간 tensor 확인하기", nodeTypes: ["output"] },
      { id: "run", label: "변경한 training graph 실행하기", needsSuccess: true },
    ],
    hint: "CSV 블록을 더블 클릭하면 업로드한 파일을 선택하고 첫 5행을 미리 볼 수 있습니다.",
  },
];
