import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { ConditionConjunction } from "./ConditionConjunction";
export class Conditional extends Tree {
  static count: number = 0;
  constructor(public conj: ConditionConjunction, public test: Tree, public left: Tree, public right: Tree) {
    super();
  }
  inspect(): string {
    return `${this.conj} (${this.test.inspect()}) {${this.left.inspect()}} else {${this.right.inspect()}}`;
  }
  get code(): Code {
    let name = `cond-${Conditional.count++}`;
    let prefix = (msg: string) => `${name}-${msg}`;
    let labelTest = prefix('test');
    let labelLeft = prefix('left');
    let labelRight = prefix('right');
    let labelDone = prefix('done');
    let conjunct: Code = this.conj === 'unless' ? [['dispatch', 'negate']] : [];
    return [
      ['jump', labelTest],
      ['label', labelLeft],
      ...this.left.code,
      ['jump', labelDone],
      ['label', labelRight],
      ...this.right.code,
      ['jump', labelDone],
      ['label', labelTest],
      ...this.test.code,
      ...conjunct,
      ['jump_if', labelLeft],
      ['jump', labelRight],
      ['label', labelDone],
    ];
    // throw new Error("Conditional.code -- Method not implemented.");
  }
}
