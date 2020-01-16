import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { Message } from "./Message";

export default class LocalVarSet extends Tree {
    constructor(public message: Message, public expr: Tree) { super(); }
    get code(): Code {
        return [
            ...this.expr.code,
            // ...this.message.code,
            // ...this.receiver.code,
            ["local_var_set",this.message.key],
            // ["local_var_get",this.message.key],
        ]
    }

    inspect() { return this.message + "=" + this.expr.inspect()}
}