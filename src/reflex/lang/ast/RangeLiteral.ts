import Tree from "./Tree";
import { Code } from '../../vm/instruction/Instruction';
export class RangeLiteral extends Tree {
  constructor(public start: Tree, public stop: Tree) { super(); }
  inspect(): string { return this.start + ".." + this.stop; }
  get code(): Code {
    return [
      ['mark', 'rng-args'],
      ...this.stop.code,
      ...this.start.code,
      ['gather', 'rng-args'],
      ['bare', 'Range'],
      ['push', 'new'],
      ['call', null],
      ['invoke', 2],
    ];
  }
}
