import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { BinaryOp } from "./BinaryOp";
export class Binary extends Tree {
  constructor(public op: BinaryOp, public left: Tree, public right: Tree) {
    super();
  }
  inspect() { return this.left.inspect() + this.op + this.right.inspect(); }
  get code(): Code {
    let opMap: {
      [op in BinaryOp]: string;
    } = {
      '+': 'add',
      '-': 'subtract',
      '*': 'multiply',
      '/': 'divide',
      '%': 'modulo',
    };
    return [
      ['mark', 'bin'],
      ...this.right.code,
      ['gather', 'bin'],
      ...this.left.code,
      ['push', opMap[this.op]],
      ['call', null],
      ['invoke', 1],
    ];
  }
}
