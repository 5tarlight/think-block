import type { ReactNode } from "react";
import NodeImpl from "../NodeImpl";
import CSV from "../../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class MinimumNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "min", [{ name: "input" }], [{ name: "min" }]);
  }

  private async tensorMin(tensor: Tensor): Promise<number> {
    const data = await tensor.data();
    let min = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i] < min) {
        min = data[i];
      }
    }
    return min;
  }

  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    if (typeof inputs.input === "number") {
      return { max: inputs.input };
    } else if (inputs.input instanceof CSV) {
      const data = inputs.input.toTensor();
      const min = await this.tensorMin(data);
      return { min };
    } else if (inputs.input instanceof Tensor) {
      const min = await this.tensorMin(inputs.input);
      return { min };
    }

    throw new Error("Invalid input: 'input' must be a number, CSV, or Tensor.");
  }

  render(): ReactNode {
    return null;
  }
}
