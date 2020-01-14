import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";



export class SendMessage extends Tree {
    constructor(public receiver: Tree, public message: Tree) {
        super();
    }
    get code(): Code {
        return [
            ...this.receiver.code,
            ...this.message.code,
            ['call', null],
        ];
    }

    inspect() { return [this.receiver.inspect(),this.message.inspect()].join(".")}
}
