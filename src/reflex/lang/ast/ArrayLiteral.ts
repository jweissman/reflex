import Tree from "./Tree";
import { Sequence } from "./Sequence";
import { Code } from '../../vm/instruction/Instruction';
export class DeconstructItem extends Tree {
  constructor(public item: Tree) { super(); }
  inspect(): string { return "..." + this.item.inspect(); }
  get code(): Code {
    return [
      ...this.item.code,
      [ 'deconstruct', null ],
    ]
  }
}
export class ArrayLiteral extends Tree {
  seq: Sequence<Tree>;
  code: Code;
  inspect(): string { return "[" + this.seq.inspect() + "]"; }
  constructor(sequence: Sequence<Tree>) {
    super();
    this.seq = sequence;
    this.code = [
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
