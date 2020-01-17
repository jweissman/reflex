import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { Arguments } from "./Arguments";
export class Barecall extends Tree {
  constructor(public fn: Tree, public args: Arguments) {
    super();
  }
  inspect(): string { return this.fn.inspect() + "(" + this.args.inspect() + ")"; }
  get code(): Code {
    let op: 'invoke_block' | 'invoke' =
      (!!this.args.block ? 'invoke_block' : 'invoke');
    return [
      ...this.args.reverse().code,
      ...this.fn.code,
      // [ 'bare', this.key ],
      [ op, this.args.length ]
    ];
  }
}
