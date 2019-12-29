import Tree from "./Tree";
import { Code } from "../../vm/Instruction";
export class Barecall extends Tree {
  constructor(public key: string, public args: Tree) {
    super();
  }
  inspect(): string { return this.key + "()"; }
  get code(): Code {
    return [
      ...this.args.code,
      ['barecall', this.key],
    ];
  }
}
