import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";

export default class MultiplicationNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "multiply",
      [{ name: "a" }, { name: "b" }],
      [{ name: "prod" }]
    );
  }

  process(inputs: Record<string, any>): Record<string, any> {
    if (typeof inputs.a !== "number" || typeof inputs.b !== "number") {
      throw new Error("Invalid inputs: 'a' and 'b' must be numbers.");
    }

    return { prod: inputs.a * inputs.b };
  }

  render(): ReactNode {
    return null;
  }
}
