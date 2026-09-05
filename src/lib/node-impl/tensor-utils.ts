import * as tf from "@tensorflow/tfjs";
import CSV from "../data/csv";

export interface LinearRegressionModelData {
  kind: "linear-regression";
  weights: number[];
  bias: number;
  featureCount: number;
  lossHistory: number[];
}

export function isLinearRegressionModel(
  value: unknown
): value is LinearRegressionModelData {
  if (!value || typeof value !== "object") return false;
  const possible = value as Partial<LinearRegressionModelData>;
  return (
    possible.kind === "linear-regression" &&
    Array.isArray(possible.weights) &&
    typeof possible.bias === "number"
  );
}

export function toTensor(value: unknown, label: string): tf.Tensor {
  if (value instanceof CSV) return value.toTensor();
  if (value instanceof tf.Tensor) return value;
  if (typeof value === "number") return tf.scalar(value);
  if (Array.isArray(value)) return tf.tensor(value as number[]);
  throw new Error(`${label} 입력에는 숫자 데이터가 필요합니다.`);
}

export function toMatrix(value: unknown, label: string): tf.Tensor2D {
  const tensor = toTensor(value, label);
  if (tensor.rank === 1) return tensor.reshape([tensor.shape[0], 1]);
  if (tensor.rank === 2) return tensor as tf.Tensor2D;
  throw new Error(`${label} 입력은 1차원 또는 2차원 데이터여야 합니다.`);
}

export function finiteNumber(
  value: unknown,
  fallback: number,
  minimum?: number
): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return minimum === undefined ? parsed : Math.max(minimum, parsed);
}
