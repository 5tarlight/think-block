import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";
import CsvWindow from "../../components/node-window/csv-window";

export default class CsvNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "csv", [], [{ name: "data" }]);
    this.winWidth = 700;
    this.winHeight = 500;
  }

  async process(): Promise<Record<string, any>> {
    this.isNewborn = false;

    return {};
  }

  render(): ReactNode {
    return <CsvWindow id={this.nodeId} />;
  }
}
