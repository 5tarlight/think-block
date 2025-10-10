import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";

export default class NumberNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "number", [], [{ name: "value" }]);
  }

  async process(): Promise<Record<string, any>> {
    return { value: 1 };
  }

  render(): ReactNode {
    return null;
  }
}
