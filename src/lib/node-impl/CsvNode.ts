import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";

export default class CsvNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "csv", [], [{ name: "data" }]);
  }

  render(): ReactNode {
    throw new Error("Method not implemented.");
  }
}
