import type { ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { toTensor } from "../tensor-utils";

export default class NormalizeNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "normalize",
      [{ name: "data" }],
      [{ name: "normalized" }, { name: "mean" }, { name: "stddev" }]
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const data = toTensor(inputs.data, "data");
    const axis = data.rank === 2 ? 0 : undefined;
    const { mean, variance } = tf.moments(data, axis);
    const stddev = tf.sqrt(variance).add(tf.scalar(1e-7));
    const normalized = data.sub(mean).div(stddev);

    variance.dispose();

    return {
      normalized,
      mean,
      stddev,
    };
  }

  render(): ReactNode {
    return null;
  }
}
