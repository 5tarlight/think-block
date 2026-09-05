import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { toMatrix } from "../tensor-utils";

export default class TrainTestSplitNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "train test split",
      [{ name: "x" }, { name: "y" }],
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

    const trainSize = Math.max(1, Math.floor(features.shape[0] * 0.8));
    const testSize = features.shape[0] - trainSize;

    const trainX = features.slice(
        [0, 0],
        [trainSize, features.shape[1]]
      );
    const testX = features.slice(
        [trainSize, 0],
        [testSize, features.shape[1]]
      );
    const trainY = labels.slice([0, 0], [trainSize, labels.shape[1]]);
    const testY = labels.slice(
        [trainSize, 0],
        [testSize, labels.shape[1]]
      );

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
