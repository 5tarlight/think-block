import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";

export default class CsvNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "csv", [], [{ name: "data" }]);
  }

  render(): ReactNode {
    return <div>CSV!</div>;
  }
}
