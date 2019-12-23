import Tree from "./Tree";
import { Code } from "../../vm/Instruction";
import { Message } from "./Message";

export default class SendMessageEq extends Tree {
    constructor(public message: Message, public expr: Tree) { super(); }
    get code(): Code {
        return [
            ...this.expr.code,
            // ...this.message.code,
            // ...this.receiver.code,
            ["send_eq",this.message.key],
        ]
    }

    inspect() { return ['self',this.message].join(".") + "=" + this.expr.inspect()}
}