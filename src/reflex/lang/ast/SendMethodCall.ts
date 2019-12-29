import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { Sequence } from "./Sequence";

export class SendMethodCall extends Tree {
    constructor(public receiver: Tree, public message: Tree, public args: Tree) {
        super();
    }
    get code(): Code {
        let args = this.args as Sequence
        return [
            ...args.reverse().code,
            ...this.receiver.code,
            ...this.message.code,
            ['call', null],
            ['invoke', args.length],
        ];
    }

    inspect() { return [this.receiver.inspect(),this.message.inspect()].join(".") + this.args.inspect()}
}
