import type { ReactNode } from "react";
import NodeImpl from "./NodeImpl";
import OutputWindow from "../../components/node-window/output-window";
import CSV from "../data/csv";
import { Tensor } from "@tensorflow/tfjs";

export default class OutputNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "output", [{ name: "in" }], []);
  }

  async process(inputs: Record<string, any>): Promise<Record<string, any>> {
    // No output component.
    // But, returned data will be stored in node data store.
    const data = inputs["in"];

    // Expand window size if data is CSV
    if (data instanceof CSV || data instanceof Tensor) {
      this.winWidth = 700;
      this.winHeight = 500;
    } else {
      this.winWidth = 300;
      this.winHeight = 200;
    }

    return { data };
  }

  render(): ReactNode {
    return <OutputWindow nodeId={this.nodeId} />;
  }
}
