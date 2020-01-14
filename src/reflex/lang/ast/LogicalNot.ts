import Tree from "./Tree";
import { Code } from '../../vm/instruction/Instruction';
export class LogicalNot extends Tree {
  constructor(public expr: Tree) {
    super();
  }
  inspect(): string {
    return `!${this.expr.inspect()}`;
  }
  get code(): Code {
    return [
      ...this.expr.code,
      ['dispatch', 'true'],
      ['dispatch', 'negate'],
    ];
  }
}
