import type { ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { toTensor } from "../tensor-utils";

export default class MeanSquaredErrorNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "mean squared error",
      [{ name: "predictions" }, { name: "actual" }],
      [{ name: "mse" }]
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const predictions = toTensor(inputs.predictions, "predictions");
    const actual = toTensor(inputs.actual, "actual");

    if (predictions.size !== actual.size) {
      throw new Error("predictions와 actual의 데이터 개수가 같아야 합니다.");
    }

    const mseTensor = tf.losses.meanSquaredError(actual, predictions).mean();
    const mse = (await mseTensor.data())[0];
    mseTensor.dispose();
    return { mse };
  }

  render(): ReactNode {
    return null;
  }
}
