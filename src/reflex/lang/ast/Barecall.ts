import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { Arguments } from "./Arguments";
export class Barecall extends Tree {
  constructor(public key: string, public args: Arguments) {
    super();
  }
  inspect(): string { return this.key + this.args.inspect(); }
  get code(): Code {
    let op: 'barecall_block' | 'barecall' = (!!this.args.block ? 'barecall_block' : 'barecall');
    return [...this.args.code, [ op, this.key ]];
  }
}
