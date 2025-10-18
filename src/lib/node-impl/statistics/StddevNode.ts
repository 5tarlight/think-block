import type { ReactNode } from "react";
import NodeImpl from "../NodeImpl";
import CSV from "../../data/csv";
import { Tensor } from "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";

export default class StddevNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "stddev", [{ name: "input" }], [{ name: "stddev" }]);
  }

  private async tensorStddev(tensor: Tensor): Promise<number> {
    const variance = tf.moments(tensor).variance;
    const stddev = tf.sqrt(variance);

    return (await stddev.data())[0];
  }

  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    if (typeof inputs.input === "number") {
      return { stddev: inputs.input };
    } else if (inputs.input instanceof CSV) {
      const data = inputs.input.toTensor();
      const stddev = await this.tensorStddev(data);
      return { stddev };
    } else if (inputs.input instanceof Tensor) {
      const stddev = await this.tensorStddev(inputs.input);
      return { stddev };
    }

    throw new Error("Invalid input: 'input' must be a number, CSV, or Tensor.");
  }

  render(): ReactNode {
    return null;
  }
}
