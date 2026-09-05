import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import CSV from "../../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class MultiplicationNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "multiply",
      [{ name: "a" }, { name: "b" }],
      [{ name: "product" }],
      "small"
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    if (inputs.a instanceof CSV) inputs.a = inputs.a.toTensor();
    if (inputs.b instanceof CSV) inputs.b = inputs.b.toTensor();

    if (typeof inputs.a === "number" && typeof inputs.b === "number") {
      return { product: inputs.a * inputs.b };
    } else if (inputs.a instanceof Tensor && inputs.b instanceof Tensor) {
      const a = inputs.a as Tensor;
      const b = inputs.b as Tensor;

      return { product: a.mul(b) };
    } else if (inputs.a instanceof Tensor && typeof inputs.b === "number") {
      const a = inputs.a as Tensor;
      const b = inputs.b as number;

      return { product: a.mul(b) };
    } else if (typeof inputs.a === "number" && inputs.b instanceof Tensor) {
      const a = inputs.a as number;
      const b = inputs.b as Tensor;

      return { product: b.mul(a) };
    }

    throw new Error("Invalid inputs: 'a' and 'b' must be numbers.");
  }

  render(): ReactNode {
    return null;
  }
}
