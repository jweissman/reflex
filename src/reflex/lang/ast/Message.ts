import Tree from "./Tree";
import { Code } from "../../vm/Instruction";
export class Message extends Tree {
    constructor(public key: string) {
        super();
    }
    get code(): Code {
        return [['push', this.key]];
    }

    inspect() { return this.key + '<msg>' }
}
