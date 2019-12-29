import Tree from "./Tree";
import { Code } from "../../vm/Instruction";

export class Bareword extends Tree {
    constructor(public word: string) {
        super();
    }
    get code(): Code {
        return [['bare', this.word]]
    }
    inspect() { return `${this.word}<bare>` }
}
