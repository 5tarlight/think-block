import type { ReactNode } from "react";
import NodeImpl from "../NodeImpl";
import CSV from "../../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class ArgminNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "argmin", [{ name: "input" }], [{ name: "index" }]);
  }

  private async tensorArgmin(tensor: Tensor): Promise<number> {
    const data = await tensor.data();
    let min = data[0];
    let argmin = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i] < min) {
        min = data[i];
        argmin = i;
      }
    }
    return argmin;
  }

  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    if (typeof inputs.input === "number") {
      return { index: 0 };
    } else if (inputs.input instanceof CSV) {
      const data = inputs.input.toTensor();
      const index = await this.tensorArgmin(data);
      return { index };
    } else if (inputs.input instanceof Tensor) {
      const index = await this.tensorArgmin(inputs.input);
      return { index };
    }

    throw new Error("Invalid input: 'input' must be a number, CSV, or Tensor.");
  }

  render(): ReactNode {
    return null;
  }
}
