import Tree from "./Tree";
import { Sequence } from "./Sequence";
import { Code } from '../../vm/instruction/Instruction';
export class ArrayLiteral extends Tree {
  constructor(public seq: Sequence<Tree>) { super(); }
  inspect(): string { return "[" + this.seq.inspect() + "]"; }
  get code(): Code {
    return [
      ['mark', 'arr-args'],
      ...this.seq.items.reverse().flatMap(it => it.code),
      ['gather', 'arr-args'],
      ['bare', 'Array'],
      ['push', 'new'],
      ['call', null],
      ['invoke', this.seq.items.length],
    ];
  }
}
