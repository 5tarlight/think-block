import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";
import CsvWindow from "../../components/node-window/csv-window";
import { useNodeDataState } from "../../store/nodeDataStore";

export default class CsvNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "csv", [], [{ name: "data" }]);
    this.winWidth = 700;
    this.winHeight = 500;
  }

  async process(): Promise<Record<string, any>> {
    const { getNodeData } = useNodeDataState.getState();
    return {
      fileKey: getNodeData(this.nodeId)?.fileKey || null,
      data: getNodeData(this.nodeId)?.csv || null,
    };
  }

  render(): ReactNode {
    return <CsvWindow id={this.nodeId} />;
  }
}
