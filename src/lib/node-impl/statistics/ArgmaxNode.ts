import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import CSV from "../../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class ArgmaxNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "argmax", [{ name: "input" }], [{ name: "index" }]);
  }

  private async tensorArgmax(tensor: Tensor): Promise<number> {
    return (await tensor.argMax().data())[0];
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    if (typeof inputs.input === "number") {
      return { index: 0 };
    } else if (inputs.input instanceof CSV) {
      const data = inputs.input.toTensor();
      const index = await this.tensorArgmax(data);
      return { index };
    } else if (inputs.input instanceof Tensor) {
      const index = await this.tensorArgmax(inputs.input);
      return { index };
    }

    throw new Error("Invalid input: 'input' must be a number, CSV, or Tensor.");
  }

  render(): ReactNode {
    return null;
  }
}
