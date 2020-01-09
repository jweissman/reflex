import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
export class Negate extends Tree {
  constructor(public expr: Tree) {
    super();
  }
  inspect() { return "-" + this.expr.inspect(); }
  get code() {
    let theCode: Code = [
      ...this.expr.code,
      ['dispatch', 'negate']
    ];
    return theCode;
  }
}
