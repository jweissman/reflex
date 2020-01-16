import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { Message } from "./Message";
export class LocalVarOrEq extends Tree {
    constructor(public message: Message, public expr: Tree) { super(); }
    get code(): Code {
        return [
            ...this.expr.code,
            ["local_var_or_eq", this.message.key],
        ];
    }
    inspect(): string {
        return this.message + "||=" + this.expr.inspect();
    }
}
