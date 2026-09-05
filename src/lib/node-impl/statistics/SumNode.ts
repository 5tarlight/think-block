import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import CSV from "../../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class SumNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "sum", [{ name: "input" }], [{ name: "sum" }]);
  }

  private async tensorSum(tensor: Tensor): Promise<number> {
    return (await tensor.sum().data())[0];
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    if (typeof inputs.input === "number") {
      return { sum: inputs.input };
    } else if (inputs.input instanceof CSV) {
      const data = inputs.input.toTensor();
      const sum = await this.tensorSum(data);
      return { sum };
    } else if (inputs.input instanceof Tensor) {
      const sum = await this.tensorSum(inputs.input);
      return { sum };
    }

    throw new Error("Invalid input: 'input' must be a number, CSV, or Tensor.");
  }

  render(): ReactNode {
    return null;
  }
}
