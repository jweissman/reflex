import { Code } from "../../vm/instruction/Instruction";
import SendMessageEq from "./SendMessageEq";
export class SendMessageOrEq extends SendMessageEq {
    get code(): Code {
        return [
            ...this.expr.code,
            ...this.receiver.code,
            ["send_or_eq", this.message.key],
        ];
    }
    inspect() { return ['self', this.message].join(".") + "||=" + this.expr.inspect(); }
}
