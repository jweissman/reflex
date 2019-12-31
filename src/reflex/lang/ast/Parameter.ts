import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
export class Parameter extends Tree {
  constructor(public name: string, public reference: boolean = false) {
    super();
  }
  inspect(): string {
    return this.reference ? `&${this.name}` : this.name;
  }
  get code(): Code {
    return [['bare', this.name]];
  }
}
