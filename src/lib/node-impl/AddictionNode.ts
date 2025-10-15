import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";
import CSV from "../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class AddictionNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "add",
      [{ name: "a" }, { name: "b" }],
      [{ name: "a + b" }],
      "small"
    );
  }

  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    if (typeof inputs.a === "number" && typeof inputs.b === "number") {
      return { sum: inputs.a + inputs.b };
    } else if (inputs.a instanceof CSV && inputs.b instanceof CSV) {
      const a = inputs.a as CSV;
      const b = inputs.b as CSV;

      return { sum: a.toTensor().add(b.toTensor()) };
    } else if (inputs.a instanceof CSV && typeof inputs.b === "number") {
      const a = inputs.a as CSV;
      const b = inputs.b as number;

      return { sum: a.toTensor().add(b) };
    } else if (typeof inputs.a === "number" && inputs.b instanceof CSV) {
      const a = inputs.a as number;
      const b = inputs.b as CSV;

      return { sum: b.toTensor().add(a) };
    } else if (inputs.a instanceof Tensor && inputs.b instanceof Tensor) {
      const a = inputs.a as Tensor;
      const b = inputs.b as Tensor;

      return { sum: a.add(b) };
    } else if (inputs.a instanceof Tensor && typeof inputs.b === "number") {
      const a = inputs.a as Tensor;
      const b = inputs.b as number;

      return { sum: a.add(b) };
    } else if (typeof inputs.a === "number" && inputs.b instanceof Tensor) {
      const a = inputs.a as number;
      const b = inputs.b as Tensor;

      return { sum: b.add(a) };
    }

    throw new Error("Invalid inputs: 'a' and 'b' must be numbers or Tensor");
  }

  render(): ReactNode {
    return null;
  }
}
