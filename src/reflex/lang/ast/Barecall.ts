import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { Arguments } from "./Arguments";
export class Barecall extends Tree {
  constructor(public key: string, public args: Arguments) {
    super();
  }
  inspect(): string { return this.key + this.args.inspect(); }
  get code(): Code {
    let op: 'invoke_block' | 'invoke' =
      (!!this.args.block ? 'invoke_block' : 'invoke');
    return [
      ...this.args.code,
      [ 'bare', this.key ],
      [ op, this.args.length ]
    ];
  }
}
