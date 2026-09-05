import type { ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { toTensor } from "../tensor-utils";

export default class MinMaxScaleNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "min max scale", [{ name: "data" }], [{ name: "scaled" }]);
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const data = toTensor(inputs.data, "data");
    const axis = data.rank === 2 ? 0 : undefined;
    const minimum = data.min(axis);
    const maximum = data.max(axis);
    const scaled = tf.tidy(() => data.sub(minimum).div(maximum.sub(minimum).add(1e-7)));
    minimum.dispose();
    maximum.dispose();
    return { scaled };
  }

  render(): ReactNode {
    return null;
  }
}
