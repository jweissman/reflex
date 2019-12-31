import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { Sequence } from "./Sequence";
import { Parameter } from "./Parameter";
export class FunctionLiteral extends Tree {
  constructor(public params: Sequence<Parameter>, public body: Tree) { super(); }
  inspect(): string {
    return `${this.params.inspect()} => ${this.body.inspect()}`;
    // throw new Error("FnLit.inspect -- Method not implemented.");
  }

  get shell(): Code {
      return [
        // load params?
        // ...this.params.code,
          ...this.body.code,
          ['ret', null]
      ]
  }

  get code(): Code { return [ ['compile', this], ]; }
}
