import Tree from "./Tree";
import { Code } from "../../vm/Instruction";

export class StringLiteral extends Tree {
    constructor(public literal: string) {
        super();
    }
    get code(): Code {
        return [['push', this.literal]]
    }
    inspect() { return '"' + this.literal + '"'; }

}