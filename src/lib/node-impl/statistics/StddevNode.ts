import type { ReactNode } from "react";
import NodeImpl from "../NodeImpl";
import CSV from "../../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class StddevNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "stddev", [{ name: "input" }], [{ name: "std. dev" }]);
  }

  private async tensorStddev(tensor: Tensor): Promise<number> {
    const data = await tensor.data();
    const n = data.length;
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < n; i++) {
      sum += data[i];
      sumSq += data[i] * data[i];
    }
    const mean = sum / n;
    const variance = sumSq / n - mean * mean;
    return Math.sqrt(variance);
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
