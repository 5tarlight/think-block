import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";

export default class NumberNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "number", [], [{ name: "value" }]);
  }

  render(): ReactNode {
    throw new Error("Method not implemented.");
  }
}
