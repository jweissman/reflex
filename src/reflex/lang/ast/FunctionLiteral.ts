import Tree from "./Tree";
import { Code } from "../../vm/Instruction";
import { Sequence } from "./Sequence";
export class FunctionLiteral extends Tree {
  constructor(public params: Sequence, public body: Tree) { super(); }
  inspect(): string {
    return `${this.params.inspect()} => ${this.body.inspect()}`;
    // throw new Error("FnLit.inspect -- Method not implemented.");
  }

  get shell(): Code {
      return [
        // load params?
          ...this.body.code,
          ['ret', null]
      ]
  }

  get code(): Code { return [ ['compile', this], ]; }
}
