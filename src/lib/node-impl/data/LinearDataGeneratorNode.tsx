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

  // BUG !!!! 오류 발생함
  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    const { n, slope, intercept, noise } = inputs;

    const x = tf.linspace(0, n - 1, n);
    const noiseTensor = tf.randomNormal([n], 0, noise);

    const y = x.mul(slope).add(intercept).add(noiseTensor).reshape([n, 1]);
    const xy = tf.concat([x, y], 1);

    return { data: xy };
  }

  render(): ReactNode {
    return <div>LNG</div>;
  }
}
