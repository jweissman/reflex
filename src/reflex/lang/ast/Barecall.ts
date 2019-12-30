import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
export class Barecall extends Tree {
  constructor(public key: string, public args: Tree) {
    super();
  }
  inspect(): string { return this.key + this.args.inspect(); }
  get code(): Code {
    return [
      ...this.args.code,
      ['barecall', this.key],
    ];
  }
}
