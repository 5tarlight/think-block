import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import CSV from "../../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class MaximumNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "max", [{ name: "input" }], [{ name: "max" }]);
  }

  private async tensorMax(tensor: Tensor): Promise<number> {
    return (await tensor.max().data())[0];
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    if (typeof inputs.input === "number") {
      return { max: inputs.input };
    } else if (inputs.input instanceof CSV) {
      const data = inputs.input.toTensor();
      const max = await this.tensorMax(data);
      return { max };
    } else if (inputs.input instanceof Tensor) {
      const max = await this.tensorMax(inputs.input);
      return { max };
    }

    throw new Error("Invalid input: 'input' must be a number, CSV, or Tensor.");
  }

  render(): ReactNode {
    return null;
  }
}
