import Tree from "./Tree";
import { Code } from "../../vm/Instruction";
import { Message } from "./Message";

export default class SendMessageEq extends Tree {
    constructor(public receiver: Tree, public message: Message, public expr: Tree) { super(); }
    get code(): Code {
        return [
            ...this.expr.code,
            // ...this.message.code,
            ...this.receiver.code,
            ["send_eq",this.message.key],
        ]
    }

    inspect() { return ['self',this.message].join(".") + "=" + this.expr.inspect()}
}

export class SendMessageOrEq extends SendMessageEq {
    // constructor(public receiver: Tree, public message: Message, public expr: Tree) { super(); }
    get code(): Code {
        return [
            ...this.expr.code,
            ...this.receiver.code,
            ["send_or_eq",this.message.key],
        ]
    }

    inspect() { return ['self',this.message].join(".") + "||=" + this.expr.inspect()}
}

export class LocalVarOrEq extends Tree {
    constructor(public message: Message, public expr: Tree) { super(); }
    get code(): Code {
        return [
            ...this.expr.code,
            ["local_var_or_eq", this.message.key],
        ]
    }
    inspect(): string {
        return ['<local>',this.message].join(".") + "||=" + this.expr.inspect();
    }
}