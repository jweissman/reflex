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
    if (this.reference) {
      return [
        // do we send call to it???
        // i.e. just get a ref to its call
        ['bare', this.name],
        // ['push', 'call'],
        ['ref', this.name],
      // ['bare', this.name]
        // ['invoke', 0],
      ];
    } else {
      return [['bare', this.name]];
    }
  }
}
