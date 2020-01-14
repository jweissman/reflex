import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";

export class StringLiteral extends Tree {
    constructor(public literal: string) {
        super();
    }
    get code(): Code {
        return [
            ['push', this.literal],
            ['bare', 'String'],
            ['push', 'new'],
            ['call', null],
            ['invoke', 1],

        ]
    }
    inspect() { return '"' + this.literal + '"'; }

}