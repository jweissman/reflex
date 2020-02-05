import Tree from "./Tree";
import { Code } from '../../vm/instruction/Instruction';
import { ArrayIndex } from './ArrayIndex';
export class ArrayIndexEq extends Tree {
  constructor(public arrayIndex: ArrayIndex, public expr: Tree) { super(); }
  inspect(): string {
    return this.arrayIndex.inspect() + "[" + this.expr.inspect() + "]";
  }
  get code(): Code {
    return [
      ['mark', 'arr-eq'],
      ...this.expr.code,
      ...this.arrayIndex.index.code,
      ['gather', 'arr-eq'],
      ...this.arrayIndex.array.code,
      ['push', 'set'],
      ['call', null],
      ['invoke', 2],
    ];
  }
}
