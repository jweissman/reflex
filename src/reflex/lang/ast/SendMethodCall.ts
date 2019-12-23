import Tree from "./Tree";
import { Code } from "../../vm/Instruction";
export class SendMethodCall extends Tree {
    constructor(public receiver: Tree, public message: Tree, public params: Tree) {
        super();
    }
    get code(): Code {
        return [
            ...this.params.code,
            ...this.receiver.code,
            ...this.message.code,
            ['call', null],
            ['invoke', null],
        ];
    }

    inspect() { return [this.receiver.inspect(),this.message.inspect()].join(".") + this.params.inspect()}
}
