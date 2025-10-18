import type { ReactNode } from "react";
import NodeImpl from "../NodeImpl";
import CSV from "../../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class AverageNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "avg", [{ name: "input" }], [{ name: "avg" }]);
  }

  private async tensorAverage(tensor: Tensor): Promise<number> {
    return (await tensor.mean().data())[0];
  }

  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    if (typeof inputs.input === "number") {
      return { avg: inputs.input };
    } else if (inputs.input instanceof CSV) {
      const data = inputs.input.toTensor();
      const avg = await this.tensorAverage(data);
      return { avg };
    } else if (inputs.input instanceof Tensor) {
      const avg = await this.tensorAverage(inputs.input);
      return { avg };
    }

    throw new Error("Invalid input: 'input' must be a number, CSV, or Tensor.");
  }

  render(): ReactNode {
    return null;
  }
}
