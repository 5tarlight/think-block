import type { ReactNode } from "react";
import NodeImpl from "../NodeImpl";
import CSV from "../../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class SumNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "argmin", [{ name: "input" }], [{ name: "sum" }]);
  }

  private async tensorSum(tensor: Tensor): Promise<number> {
    return (await tensor.sum().data())[0];
  }

  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    if (typeof inputs.input === "number") {
      return { index: 0 };
    } else if (inputs.input instanceof CSV) {
      const data = inputs.input.toTensor();
      const index = await this.tensorSum(data);
      return { index };
    } else if (inputs.input instanceof Tensor) {
      const index = await this.tensorSum(inputs.input);
      return { index };
    }

    throw new Error("Invalid input: 'input' must be a number, CSV, or Tensor.");
  }

  render(): ReactNode {
    return null;
  }
}
