import type { ReactNode } from "react";
import NodeImpl from "../NodeImpl";
import * as tf from "@tensorflow/tfjs";

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
      [{ name: "data" }],
      "full"
    );
  }

  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    const { n, slope, intercept, noise } = inputs;

    const x = tf.linspace(0, n - 1, n);
    const noiseTensor = tf.randomNormal([n], 0, noise);

    const y = x.mul(slope).add(intercept).add(noiseTensor);

    return { data: y };
  }

  render(): ReactNode {
    return <div>LNG</div>;
  }
}
