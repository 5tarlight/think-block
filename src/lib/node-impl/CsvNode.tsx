import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";

export default class CsvNode extends NodeImpl {
  private file: string = "";

  constructor(nodeId: string) {
    super(nodeId, "csv", [], [{ name: "data" }]);
  }

  public override process(): any {
    return this.file;
  }

  render(): ReactNode {
    return <div>CSV!</div>;
  }
}
