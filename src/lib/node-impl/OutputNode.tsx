import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";
import OutputWindow from "../../components/node-window/output-window";

export default class OutputNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "output", [{ name: "in" }], []);
  }

  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    console.log(inputs);
    // No output component.
    // But, returned data will be stored in node data store.
    return { data: inputs["in"] };
  }

  render(): ReactNode {
    return <OutputWindow nodeId={this.nodeId} />;
  }
}
