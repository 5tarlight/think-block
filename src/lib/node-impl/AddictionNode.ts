import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";

export default class AddictionNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "add", [{ name: "a" }, { name: "b" }], [{ name: "sum" }]);
  }

  render(): ReactNode {
    throw new Error("Method not implemented.");
  }
}
