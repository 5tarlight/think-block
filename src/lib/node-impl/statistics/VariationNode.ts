import type { ReactNode } from "react";
import NodeImpl from "../NodeImpl";
import CSV from "../../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class VariationNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "variation", [{ name: "input" }], [{ name: "variation" }]);
  }

  private async tensorVariation(tensor: Tensor): Promise<number> {
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
    return variance;
  }

  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    if (typeof inputs.input === "number") {
      return { variation: inputs.input };
    } else if (inputs.input instanceof CSV) {
      const data = inputs.input.toTensor();
      const variation = await this.tensorVariation(data);
      return { variation };
    } else if (inputs.input instanceof Tensor) {
      const variation = await this.tensorVariation(inputs.input);
      return { variation };
    }

    throw new Error("Invalid input: 'input' must be a number, CSV, or Tensor.");
  }

  render(): ReactNode {
    return null;
  }
}
