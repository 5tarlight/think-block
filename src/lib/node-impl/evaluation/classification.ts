import * as tf from "@tensorflow/tfjs";
import { toTensor } from "../tensor-utils";

export interface ConfusionMatrixData {
  kind: "confusion-matrix";
  labels: number[];
  matrix: number[][];
  total: number;
  correct: number;
}

export interface ClassificationReport {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusionMatrix: ConfusionMatrixData;
}

export function isConfusionMatrixData(value: unknown): value is ConfusionMatrixData {
  return (
    !!value &&
    typeof value === "object" &&
    (value as Partial<ConfusionMatrixData>).kind === "confusion-matrix" &&
    Array.isArray((value as Partial<ConfusionMatrixData>).matrix)
  );
}

async function classIds(value: unknown, label: string, prediction: boolean) {
  const tensor = toTensor(value, label);
  if (tensor.rank > 2) {
    throw new Error(`${label}은 class index 또는 2차원 score tensor여야 합니다.`);
  }
  if (tensor.rank === 2 && (tensor.shape[1] ?? 0) > 1) {
    const indices = tf.argMax(tensor, 1);
    const result = Array.from(await indices.data(), Number);
    indices.dispose();
    return result;
  }
  const values = Array.from(await tensor.data(), Number);
  return values.map((item) =>
    prediction ? (item >= 0.5 ? 1 : 0) : Math.round(item)
  );
}

export async function classificationReport(
  predictions: unknown,
  targets: unknown
): Promise<ClassificationReport> {
  const [predicted, actual] = await Promise.all([
    classIds(predictions, "predictions", true),
    classIds(targets, "targets", false),
  ]);
  if (predicted.length !== actual.length || predicted.length === 0) {
    throw new Error("predictions와 targets의 sample 개수가 같아야 합니다.");
  }

  const labels = Array.from(new Set([...actual, ...predicted])).sort((a, b) => a - b);
  const labelIndex = new Map(labels.map((label, index) => [label, index]));
  const matrix = labels.map(() => labels.map(() => 0));
  predicted.forEach((prediction, index) => {
    matrix[labelIndex.get(actual[index])!][labelIndex.get(prediction)!] += 1;
  });

  let correct = 0;
  let precision = 0;
  let recall = 0;
  let f1 = 0;
  labels.forEach((_label, index) => {
    const tp = matrix[index][index];
    const fp = matrix.reduce((sum, row, rowIndex) => sum + (rowIndex === index ? 0 : row[index]), 0);
    const fn = matrix[index].reduce((sum, count, columnIndex) => sum + (columnIndex === index ? 0 : count), 0);
    const classPrecision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const classRecall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const classF1 =
      classPrecision + classRecall === 0
        ? 0
        : (2 * classPrecision * classRecall) / (classPrecision + classRecall);
    correct += tp;
    precision += classPrecision;
    recall += classRecall;
    f1 += classF1;
  });

  return {
    accuracy: correct / predicted.length,
    precision: precision / labels.length,
    recall: recall / labels.length,
    f1: f1 / labels.length,
    confusionMatrix: {
      kind: "confusion-matrix",
      labels,
      matrix,
      total: predicted.length,
      correct,
    },
  };
}
