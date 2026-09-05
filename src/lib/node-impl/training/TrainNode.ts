import type { ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { finiteNumber, toMatrix } from "../tensor-utils";
import {
  isLossSpec,
  isOptimizerSpec,
  isSequentialModelSpec,
  type LayerSpec,
} from "../model/module-spec";

function createModel(layers: LayerSpec[]) {
  const model = tf.sequential();
  let previousFeatures: number | null = null;

  layers.forEach((layer, index) => {
    if (layer.kind === "linear") {
      if (previousFeatures !== null && previousFeatures !== layer.inFeatures) {
        throw new Error(
          `${index + 1}번째 Linear의 in_features=${layer.inFeatures}가 앞 레이어 출력 ${previousFeatures}와 다릅니다.`
        );
      }
      model.add(
        tf.layers.dense({
          units: layer.outFeatures,
          inputShape: previousFeatures === null ? [layer.inFeatures] : undefined,
          useBias: layer.bias,
          kernelInitializer: "glorotUniform",
          biasInitializer: "zeros",
        })
      );
      previousFeatures = layer.outFeatures;
    } else if (layer.kind === "relu") {
      if (previousFeatures === null) throw new Error("ReLU 앞에 Linear 레이어가 필요합니다.");
      model.add(tf.layers.activation({ activation: "relu" }));
    } else if (layer.kind === "sigmoid") {
      if (previousFeatures === null) throw new Error("Sigmoid 앞에 Linear 레이어가 필요합니다.");
      model.add(tf.layers.activation({ activation: "sigmoid" }));
    } else if (layer.kind === "dropout") {
      if (previousFeatures === null) throw new Error("Dropout 앞에 Linear 레이어가 필요합니다.");
      model.add(tf.layers.dropout({ rate: layer.probability }));
    }
  });

  return model;
}

export default class TrainNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "train",
      [
        { name: "model" },
        { name: "train_x" },
        { name: "train_y" },
        { name: "criterion" },
        { name: "optimizer" },
        { name: "epochs" },
      ],
      [{ name: "trained_model" }, { name: "loss" }]
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    await tf.ready();
    if (!isSequentialModelSpec(inputs.model)) {
      throw new Error("model 입력에 Sequential 블록을 연결하세요.");
    }

    const trainX = toMatrix(inputs.train_x, "train_x");
    const trainY = toMatrix(inputs.train_y, "train_y");
    const firstLinear = inputs.model.layers.find((layer) => layer.kind === "linear");
    const lastLinear = [...inputs.model.layers]
      .reverse()
      .find((layer) => layer.kind === "linear");
    if (!firstLinear || !lastLinear) {
      throw new Error("모델에 Linear 레이어가 필요합니다.");
    }
    if (trainX.shape[1] !== firstLinear.inFeatures) {
      throw new Error(
        `train_x의 특성 수 ${trainX.shape[1]}와 첫 Linear의 in_features ${firstLinear.inFeatures}가 다릅니다.`
      );
    }
    if (trainY.shape[1] !== lastLinear.outFeatures) {
      throw new Error(
        `train_y의 열 수 ${trainY.shape[1]}와 마지막 Linear의 out_features ${lastLinear.outFeatures}가 다릅니다.`
      );
    }
    if (trainX.shape[0] !== trainY.shape[0]) {
      throw new Error("train_x와 train_y의 행 개수가 같아야 합니다.");
    }

    const optimizer = isOptimizerSpec(inputs.optimizer)
      ? inputs.optimizer
      : { kind: "optimizer-spec" as const, name: "adam" as const, learningRate: 0.03 };
    const criterion = isLossSpec(inputs.criterion)
      ? inputs.criterion
      : { kind: "loss-spec" as const, name: "meanSquaredError" as const };
    const epochs = Math.min(500, Math.round(finiteNumber(inputs.epochs, 80, 1)));
    const model = createModel(inputs.model.layers);
    model.compile({
      optimizer:
        optimizer.name === "sgd"
          ? tf.train.sgd(optimizer.learningRate)
          : tf.train.adam(optimizer.learningRate),
      loss: criterion.name,
    });

    const lossHistory: number[] = [];
    await model.fit(trainX, trainY, {
      epochs,
      batchSize: Math.min(16, trainX.shape[0]),
      shuffle: true,
      verbose: 0,
      callbacks: {
        onEpochEnd: async (_epoch, logs) => {
          if (typeof logs?.loss === "number") lossHistory.push(logs.loss);
        },
      },
    });

    const modelWeights = model.getWeights();
    const denseWeights = [];
    let weightIndex = 0;
    for (const layer of inputs.model.layers) {
      if (layer.kind !== "linear") continue;
      const kernel = modelWeights[weightIndex];
      const bias = modelWeights[weightIndex + 1];
      const [kernelValues, biasValues] = await Promise.all([
        kernel.data(),
        bias.data(),
      ]);
      denseWeights.push({
        kernel: Array.from(kernelValues),
        kernelShape: [layer.inFeatures, layer.outFeatures] as [number, number],
        bias: Array.from(biasValues),
      });
      weightIndex += 2;
    }
    model.dispose();

    return {
      trained_model: {
        kind: "sequential-model",
        layers: inputs.model.layers,
        denseWeights,
        lossHistory,
      },
      loss: lossHistory.at(-1) ?? Number.NaN,
    };
  }

  render(): ReactNode {
    return null;
  }
}
