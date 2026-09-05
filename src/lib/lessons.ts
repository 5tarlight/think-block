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
    title: "직선을 학습시키기",
    duration: "약 12분",
    level: "입문",
    concept: "모델은 입력과 정답의 관계를 반복해서 비교하며 오차가 작아지는 방향을 찾습니다.",
    templateId: "regression",
    checks: [
      { id: "data", label: "샘플 데이터를 준비하기", nodeTypes: ["linear data generator"] },
      { id: "split", label: "학습용과 테스트용으로 나누기", nodeTypes: ["train test split"] },
      { id: "model", label: "선형 회귀와 예측 블록 연결하기", nodeTypes: ["linear regression", "predict"] },
      { id: "evaluate", label: "MSE로 예측을 평가하기", nodeTypes: ["mean squared error"], needsMse: true },
      { id: "run", label: "전체 그래프를 오류 없이 실행하기", needsSuccess: true },
    ],
    hint: "MSE는 0에 가까울수록 예측과 실제 값이 비슷합니다. 데이터에 잡음이 있으므로 정확히 0이 아니어도 괜찮아요.",
  },
  {
    id: "read-data",
    title: "데이터의 모양 읽기",
    duration: "약 8분",
    level: "입문",
    concept: "평균은 중심, 중앙값은 순서상의 가운데, 표준편차는 값이 퍼진 정도를 설명합니다.",
    templateId: "statistics",
    checks: [
      { id: "center", label: "평균과 중앙값을 함께 연결하기", nodeTypes: ["avg", "median"] },
      { id: "spread", label: "표준편차로 퍼짐 확인하기", nodeTypes: ["stddev"] },
      { id: "run", label: "세 통계를 계산하기", needsSuccess: true },
    ],
    hint: "평균과 중앙값의 차이가 크다면 일부 값이 한쪽으로 치우쳤을 가능성이 있습니다.",
  },
  {
    id: "own-data",
    title: "내 데이터로 실험하기",
    duration: "약 15분",
    level: "도전",
    concept: "좋은 실험은 데이터의 출처와 열의 의미를 먼저 확인하고, 같은 평가 기준으로 모델을 비교합니다.",
    templateId: "regression",
    checks: [
      { id: "csv", label: "CSV 블록 추가하기", nodeTypes: ["csv"] },
      { id: "normalize", label: "정규화 블록을 사용해 보기", nodeTypes: ["normalize"] },
      { id: "output", label: "중간 결과를 결과 보기로 확인하기", nodeTypes: ["output"] },
      { id: "run", label: "변경한 그래프 실행하기", needsSuccess: true },
    ],
    hint: "CSV 블록을 더블 클릭하면 업로드한 파일을 선택하고 첫 5행을 미리 볼 수 있습니다.",
  },
];
