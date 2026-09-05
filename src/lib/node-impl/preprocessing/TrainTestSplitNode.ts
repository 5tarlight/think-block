import type { ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { finiteNumber, toMatrix } from "../tensor-utils";

function shuffledIndices(length: number, seed: number) {
  const indices = Array.from({ length }, (_, index) => index);
  let state = seed >>> 0;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let index = length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(next() * (index + 1));
    [indices[index], indices[swapIndex]] = [indices[swapIndex], indices[index]];
  }
  return indices;
}

export default class TrainTestSplitNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "train test split",
      [{ name: "x" }, { name: "y" }, { name: "test_ratio" }, { name: "seed" }],
      [
        { name: "train_x" },
        { name: "test_x" },
        { name: "train_y" },
        { name: "test_y" },
      ]
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const features = toMatrix(inputs.x ?? inputs.features, "x");
    const labels = toMatrix(inputs.y ?? inputs.labels, "y");

    if (features.shape[0] !== labels.shape[0]) {
      throw new Error("features와 labels의 행 개수가 같아야 합니다.");
    }
    if (features.shape[0] < 4) {
      throw new Error("학습/테스트 분리에는 최소 4개의 데이터가 필요합니다.");
    }

    const testRatio = Math.min(0.5, finiteNumber(inputs.test_ratio, 0.2, 0.05));
    const seed = Math.round(finiteNumber(inputs.seed, 42));
    const order = tf.tensor1d(shuffledIndices(features.shape[0], seed), "int32");
    const shuffledFeatures = tf.gather(features, order) as tf.Tensor2D;
    const shuffledLabels = tf.gather(labels, order) as tf.Tensor2D;
    order.dispose();
    const trainSize = Math.max(1, Math.floor(features.shape[0] * (1 - testRatio)));
    const testSize = features.shape[0] - trainSize;

    const trainX = shuffledFeatures.slice(
        [0, 0],
        [trainSize, features.shape[1]]
      );
    const testX = shuffledFeatures.slice(
        [trainSize, 0],
        [testSize, features.shape[1]]
      );
    const trainY = shuffledLabels.slice([0, 0], [trainSize, labels.shape[1]]);
    const testY = shuffledLabels.slice(
        [trainSize, 0],
        [testSize, labels.shape[1]]
      );
    shuffledFeatures.dispose();
    shuffledLabels.dispose();

    return {
      train_x: trainX,
      test_x: testX,
      train_y: trainY,
      test_y: testY,
      // Old saved projects keep their original port names.
      "train features": trainX,
      "test features": testX,
      "train labels": trainY,
      "test labels": testY,
    };
  }

  render(): ReactNode {
    return null;
  }
}
