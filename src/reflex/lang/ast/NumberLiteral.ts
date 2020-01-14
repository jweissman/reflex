import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
export class NumberLiteral extends Tree {
  constructor(public value: number, public float: boolean = false) { super(); }
  inspect(): string {
    return this.value.toString();
  }
  get code(): Code {
    return [
      ['push', this.value],
      ['bare', this.float ? 'Float' : 'Integer'],
      ['push', 'new'],
      ['call', null],
      ['invoke', 1],
    //   ['dispatch', 'new'],
    ];
    // throw new Error("NumberLiteral.code -- Method not implemented.");
  }
}
