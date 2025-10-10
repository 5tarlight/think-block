import type { ReactNode } from "react";
import type { NodeType } from "../node";
import { uid, type Port } from "../../store/graphics";

export default abstract class NodeImpl {
  public nodeId: string;
  public nodeType: NodeType;
  public inputs: Port[];
  public outputs: Port[];
  public isNewborn: boolean = true;
  public isUpdated: boolean = false;
  public winWidth: number = 300;
  public winHeight: number = 200;

  constructor(
    nodeId: string,
    nodeType: NodeType,
    inputs: { name: string }[],
    outputs: { name: string }[]
  ) {
    this.nodeId = nodeId;
    this.nodeType = nodeType;
    this.inputs = inputs.map(({ name }) => ({
      id: uid("p"),
      name,
      kind: "in",
    }));
    this.outputs = outputs.map(({ name }) => ({
      id: uid("p"),
      name,
      kind: "out",
    }));
  }

  abstract process(inputs: Record<string, any>): Promise<Record<string, any>>;
  abstract render(): ReactNode;
}
