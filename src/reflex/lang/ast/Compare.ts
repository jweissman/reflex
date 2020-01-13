import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { Comparator } from "./Comparator";
export class Compare extends Tree {
  constructor(public op: Comparator, public left: Tree, public right: Tree) { super(); }
  inspect(): string {
    return [this.left.inspect(), this.op, this.right.inspect()].join();
  }
  get code(): Code {
    let ops: {
      [key in Comparator]: string;
    } = {
      '==': 'eq',
      '!=': 'neq',
      '>': 'gt',
      '>=': 'gte',
      '<': 'lt',
      '<=': 'lte',
     };
    return [
      ...this.right.code,
      ...this.left.code,
      ['push', ops[this.op]],
      ['call', null],
      ['invoke', 1],
    ];
  }
}
