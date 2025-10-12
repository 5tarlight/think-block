import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";

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
    if (typeof inputs.a !== "number" || typeof inputs.b !== "number") {
      throw new Error("Invalid inputs: 'a' and 'b' must be numbers.");
    }

    return { sum: inputs.a + inputs.b };
  }

  render(): ReactNode {
    return null;
  }
}
