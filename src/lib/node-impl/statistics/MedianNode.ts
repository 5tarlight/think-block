import type { ReactNode } from "react";
import NodeImpl from "../NodeImpl";
import CSV from "../../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class MedianNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "median", [{ name: "input" }], [{ name: "median" }]);
  }

  private async tensorMedian(tensor: Tensor): Promise<number> {
    const data = await tensor.data();
    const sorted = Array.from(data).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }

  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    if (typeof inputs.input === "number") {
      return { median: inputs.input };
    } else if (inputs.input instanceof CSV) {
      const data = inputs.input.toTensor();
      const median = await this.tensorMedian(data);
      return { median };
    } else if (inputs.input instanceof Tensor) {
      const median = await this.tensorMedian(inputs.input);
      return { median };
    }

    throw new Error("Invalid input: 'input' must be a number, CSV, or Tensor.");
  }

  render(): ReactNode {
    return null;
  }
}
