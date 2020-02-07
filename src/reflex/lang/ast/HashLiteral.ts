import Tree from "./Tree";
import { Sequence } from "./Sequence";
import { Code } from '../../vm/instruction/Instruction';
export class HashLiteral extends Tree {
  seq: Sequence<Tree>;
  code: Code;
  inspect(): string { return "[" + this.seq.inspect() + "]"; }
  constructor(sequence: Sequence<Tree>) {
    super();
    this.seq = sequence;
    this.code = [
      ['mark', 'hsh-args'],
      ['mark', 'arr-args'],
      ...this.seq.items.reverse().flatMap(it => it.code),
      ['gather', 'arr-args'],
      ['bare', 'Array'],
      ['push', 'new'],
      ['call', null],
      ['invoke', this.seq.items.length],
      ['gather', 'hsh-args'],
      ['bare', 'Hash'],
      ['push', 'new'],
      ['call', null],
      ['invoke', this.seq.items.length],
    ];
  }
}
