import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";
import CSV from "../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class MultiplicationNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "multiply",
      [{ name: "a" }, { name: "b" }],
      [{ name: "a * b" }],
      "small"
    );
  }

  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    if (inputs.a instanceof CSV) inputs.a = inputs.a.toTensor();
    if (inputs.b instanceof CSV) inputs.b = inputs.b.toTensor();

    if (typeof inputs.a === "number" && typeof inputs.b === "number") {
      return { prod: inputs.a * inputs.b };
    } else if (inputs.a instanceof Tensor && inputs.b instanceof Tensor) {
      const a = inputs.a as Tensor;
      const b = inputs.b as Tensor;

      return { prod: a.mul(b) };
    } else if (inputs.a instanceof Tensor && typeof inputs.b === "number") {
      const a = inputs.a as Tensor;
      const b = inputs.b as number;

      return { prod: a.mul(b) };
    } else if (typeof inputs.a === "number" && inputs.b instanceof Tensor) {
      const a = inputs.a as number;
      const b = inputs.b as Tensor;

      return { prod: b.mul(a) };
    } else if (inputs.a instanceof Tensor && typeof inputs.b === "number") {
      const a = inputs.a as Tensor;
      const b = inputs.b as number;

      return { prod: a.mul(b) };
    } else if (typeof inputs.a === "number" && inputs.b instanceof Tensor) {
      const a = inputs.a as number;
      const b = inputs.b as Tensor;

      return { prod: b.mul(a) };
    }

    throw new Error("Invalid inputs: 'a' and 'b' must be numbers.");
  }

  render(): ReactNode {
    return null;
  }
}
