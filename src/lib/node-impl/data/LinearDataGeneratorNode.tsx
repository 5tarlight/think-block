import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import * as tf from "@tensorflow/tfjs";
import { finiteNumber } from "../tensor-utils";

export default class LinearDataGeneratorNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "linear data generator",
      [
        { name: "n" },
        { name: "slope" },
        { name: "intercept" },
        { name: "noise" },
      ],
      [{ name: "features" }, { name: "labels" }],
      "full"
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const n = Math.min(1000, Math.round(finiteNumber(inputs.n, 48, 4)));
    const slope = finiteNumber(inputs.slope, 1.8);
    const intercept = finiteNumber(inputs.intercept, 2);
    const noise = finiteNumber(inputs.noise, 1.5, 0);

    const features = tf.linspace(0, n - 1, n).reshape([n, 1]);
    const noiseTensor = tf.randomNormal([n, 1], 0, noise, "float32", 42);
    const labels = features.mul(slope).add(intercept).add(noiseTensor);
    noiseTensor.dispose();

    return { features, labels };
  }

  render(): ReactNode {
    return null;
  }
}
