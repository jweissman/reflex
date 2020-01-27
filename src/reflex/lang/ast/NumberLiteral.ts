import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
export class NumberLiteral extends Tree {
  code: Code;
  constructor(public literalValue: number, public float: boolean = false) {
    super();
    // console.log("GEN CODE FOR NUM LIT: " + this.literalValue)
    if (typeof this.literalValue !== 'number') {
      throw new Error("Number literal must be a number, got: " + this.literalValue)
    }
    this.code = [
      ['push', [this.literalValue]],
      ['bare', this.float ? 'Float' : 'Integer'],
      ['push', 'new'],
      ['call', null],
      ['invoke', 1],
    ];
    // console.log
  }

  inspect(): string {
    return this.literalValue.toString();
  }
}
