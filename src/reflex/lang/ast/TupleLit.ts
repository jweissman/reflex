import Tree from "./Tree";
import { Code } from '../../vm/instruction/Instruction';
export class TupleLit extends Tree {
  code: Code;
  constructor(public key: string, public value: Tree) {
    super();
    this.code = [
      ['mark', 'tuple-args'],
      ...this.value.code,
      ['push', [this.key]],
      ['bare', 'Symbol'],
      ['push', 'new'],
      ['call', null],
      ['invoke', 1],
      ['gather', 'tuple-args'],
      ['bare', 'Tuple'],
      ['push', 'new'],
      ['call', null],
      ['invoke', 2],
    ];
  }
  inspect(): string { return this.key + " => " + this.value.inspect(); }
}
