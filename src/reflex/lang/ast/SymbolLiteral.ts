import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
export class SymbolLiteral extends Tree {
    code: Code;
    constructor(public literal: string) {
        super();
        this.code = [
            ['push', [this.literal]],
            ['bare', 'Symbol'],
            ['push', 'new'],
            ['call', null],
            ['invoke', 1],
        ];
    }
    inspect() { return ':' + this.literal; }
}
