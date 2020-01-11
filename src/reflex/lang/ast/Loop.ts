import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { LoopKeyword } from "./LoopKeyword";
export class Loop extends Tree {
  static count: number = 0;
  constructor(public keyword: LoopKeyword, public test: Tree, public block: Tree) {
    super();
  }
  inspect(): string {
    return this.keyword + "(" + this.test.inspect() + ") {" + this.block.inspect() + "}";
  }
  get code(): Code {
    // throw new Error("Loop.code -- Method not implemented.");
    let name = `loop-${Loop.count++}`;
    let prefix = (msg: string) => `${name}-${msg}`;
    let labelBegin = prefix('begin');
    let labelEnd = prefix('end');
    let flipTest: Code = this.keyword === 'while' ? [['dispatch', 'negate']] : [];
    return [
      ['label', labelBegin],
      ...this.test.code,
      ...flipTest,
      ['jump_if', labelEnd],
      // ['pop', null],
      ...this.block.code,
      ['jump', labelBegin],
      ['label', labelEnd],
    ];
  }
}
