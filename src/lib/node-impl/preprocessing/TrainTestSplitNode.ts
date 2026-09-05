import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { toMatrix } from "../tensor-utils";

export default class TrainTestSplitNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "train test split",
      [{ name: "features" }, { name: "labels" }],
      [
        { name: "train features" },
        { name: "test features" },
        { name: "train labels" },
        { name: "test labels" },
      ]
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const features = toMatrix(inputs.features, "features");
    const labels = toMatrix(inputs.labels, "labels");

    if (features.shape[0] !== labels.shape[0]) {
      throw new Error("features와 labels의 행 개수가 같아야 합니다.");
    }
    if (features.shape[0] < 4) {
      throw new Error("학습/테스트 분리에는 최소 4개의 데이터가 필요합니다.");
    }

    const trainSize = Math.max(1, Math.floor(features.shape[0] * 0.8));
    const testSize = features.shape[0] - trainSize;

    return {
      "train features": features.slice(
        [0, 0],
        [trainSize, features.shape[1]]
      ),
      "test features": features.slice(
        [trainSize, 0],
        [testSize, features.shape[1]]
      ),
      "train labels": labels.slice([0, 0], [trainSize, labels.shape[1]]),
      "test labels": labels.slice(
        [trainSize, 0],
        [testSize, labels.shape[1]]
      ),
    };
  }

  render(): ReactNode {
    return null;
  }
}
