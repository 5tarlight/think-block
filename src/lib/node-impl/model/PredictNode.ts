import type { ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { isLinearRegressionModel, toMatrix } from "../tensor-utils";
import { isTrainedSequentialModel } from "./module-spec";

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
    const features = toMatrix(inputs.features, "features");
    if (isLinearRegressionModel(inputs.model)) {
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

    if (!isTrainedSequentialModel(inputs.model)) {
      throw new Error("model 입력에 Train이 출력한 trained_model을 연결하세요.");
    }

    let value: tf.Tensor = features;
    let ownsValue = false;
    let denseIndex = 0;
    for (const layer of inputs.model.layers) {
      let next: tf.Tensor;
      if (layer.kind === "linear") {
        const weights = inputs.model.denseWeights[denseIndex++];
        if (!weights) throw new Error("저장된 Linear 가중치를 찾지 못했습니다.");
        next = tf.tidy(() => {
          const kernel = tf.tensor2d(weights.kernel, weights.kernelShape);
          const bias = tf.tensor1d(weights.bias);
          return (value as tf.Tensor2D).matMul(kernel).add(bias);
        });
      } else if (layer.kind === "relu") {
        next = value.relu();
      } else if (layer.kind === "sigmoid") {
        next = value.sigmoid();
      } else {
        continue;
      }
      if (ownsValue) value.dispose();
      value = next;
      ownsValue = true;
    }

    return { predictions: value };
  }

  render(): ReactNode {
    return null;
  }
}
