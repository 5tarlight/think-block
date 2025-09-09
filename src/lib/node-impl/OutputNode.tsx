import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";

export default class OutputNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "output", [{ name: "data" }], []);
  }

  process(): Record<string, any> {
    return {};
  }

  render(): ReactNode {
    // TODO : Implement UI
    return null;
  }
}
