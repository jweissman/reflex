import Tree from "./Tree";
import { Program } from "./Program";
import { Sequence } from "./Sequence";
import { FunctionLiteral } from "./FunctionLiteral";
import { Code } from "../../vm/instruction/Instruction";
import { Parameter } from "./Parameter";
export class PipedBlock extends Tree {
  constructor(public pipeVars: Sequence<Parameter>, public body: Program) {
    super();
  }
  inspect(): string {
    return `{|${this.pipeVars.inspect()}| ${this.body.inspect()}}`;
  }
  get code(): Code {
    return [
      ['compile', new FunctionLiteral(this.pipeVars, this.body)]
    ];
    // throw new Error("PipedBlock.code -- Method not implemented.");
  }
}
