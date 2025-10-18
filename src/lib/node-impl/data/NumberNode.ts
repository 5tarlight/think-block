import type { ReactNode } from "react";
import NodeImpl from "../NodeImpl";
import { useNodeDataState } from "../../../store/nodeDataStore";

export default class NumberNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "number", [], [{ name: "value" }], "input");
  }

  async process(): Promise<Record<string, any>> {
    const { getNodeData } = useNodeDataState.getState();
    return { value: getNodeData(this.nodeId)?.value || 0 };
  }

  render(): ReactNode {
    return null;
  }
}
