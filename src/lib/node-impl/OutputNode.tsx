import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";

export default class OutputNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "output", [{ name: "data" }], []);
  }

  render(): ReactNode {
    throw new Error("Method not implemented.");
  }
}
