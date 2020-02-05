import Tree from "./Tree";
import { Code } from '../../vm/instruction/Instruction';
export class ArrayIndex extends Tree {
  constructor(public array: Tree, public index: Tree) {
    super();
  }
  inspect(): string {
    return this.array.inspect() + "[" + this.index.inspect() + "]";
  }
  get code(): Code {
    return [
      ['mark', 'index'],
      ...this.index.code,
      ['gather', 'index'],
      ...this.array.code,
      ['push', 'get'],
      ['call', null],
      ['invoke', 1],
    ];
  }
}
