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

  render(): ReactNode {
    throw new Error("Method not implemented.");
  }
}
