import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
export class Parameter extends Tree {
  constructor(public name: string) { super(); }
  inspect(): string { return this.name }
  get code(): Code { return [['bare', this.name]]; }
}

export class ParameterReference extends Parameter {
  inspect(): string { return `&${this.name}` }
  get code(): Code {
      return [
        ['bare', this.name],
        ['ref', this.name],
      ];
  } 
}

export class ParameterDestructuring extends Parameter {
  inspect(): string { return `...${this.name}` }
  get code(): Code {
      return [
        ['bare', this.name],
      ];
  } 
}