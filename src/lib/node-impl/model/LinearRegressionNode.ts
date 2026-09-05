import type { ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { finiteNumber, toMatrix } from "../tensor-utils";

export default class LinearRegressionNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "linear regression",
      [
        { name: "features" },
        { name: "labels" },
        { name: "epochs" },
        { name: "learning rate" },
      ],
      [{ name: "model" }, { name: "loss" }]
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    await tf.ready();
    const features = toMatrix(inputs.features, "features");
    const labels = toMatrix(inputs.labels, "labels");
    const epochs = Math.min(
      500,
      Math.round(finiteNumber(inputs.epochs, 80, 1))
    );
    const learningRate = Math.min(
      1,
      finiteNumber(inputs["learning rate"], 0.03, 0.00001)
    );

    if (features.shape[0] !== labels.shape[0]) {
      throw new Error("features와 labels의 행 개수가 같아야 합니다.");
    }
    if (labels.shape[1] !== 1) {
      throw new Error("선형 회귀 labels는 열이 하나여야 합니다.");
    }

    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        units: 1,
        inputShape: [features.shape[1]],
        kernelInitializer: "zeros",
        biasInitializer: "zeros",
      })
    );
    model.compile({
      optimizer: tf.train.adam(learningRate),
      loss: "meanSquaredError",
    });

    const lossHistory: number[] = [];
    await model.fit(features, labels, {
      epochs,
      batchSize: Math.min(16, features.shape[0]),
      shuffle: true,
      verbose: 0,
      callbacks: {
        onEpochEnd: async (_epoch, logs) => {
          const loss = logs?.loss;
          if (typeof loss === "number") lossHistory.push(loss);
        },
      },
    });

    const [kernel, bias] = model.getWeights();
    const [weightValues, biasValues] = await Promise.all([
      kernel.data(),
      bias.data(),
    ]);
    const finalLoss = lossHistory.at(-1) ?? Number.NaN;

    model.dispose();

    return {
      model: {
        kind: "linear-regression",
        weights: Array.from(weightValues),
        bias: biasValues[0],
        featureCount: features.shape[1],
        lossHistory,
      },
      loss: finalLoss,
    };
  }

  render(): ReactNode {
    return null;
  }
}
