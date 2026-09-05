import type { ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { isLinearRegressionModel, toMatrix } from "../tensor-utils";

export default class PredictNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "predict",
      [{ name: "model" }, { name: "features" }],
      [{ name: "predictions" }]
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    if (!isLinearRegressionModel(inputs.model)) {
      throw new Error("model 입력에 학습된 선형 회귀 모델을 연결하세요.");
    }

    const features = toMatrix(inputs.features, "features");
    if (features.shape[1] !== inputs.model.featureCount) {
      throw new Error("학습 데이터와 예측 데이터의 특성 개수가 다릅니다.");
    }

    const weights = tf.tensor2d(inputs.model.weights, [
      inputs.model.featureCount,
      1,
    ]);
    const predictions = features.matMul(weights).add(inputs.model.bias);
    weights.dispose();

    return { predictions };
  }

  render(): ReactNode {
    return null;
  }
}
