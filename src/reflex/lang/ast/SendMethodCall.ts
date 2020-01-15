import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { Arguments } from "./Arguments";

export class SendMethodCall extends Tree {
    constructor(public receiver: Tree, public message: Tree, public args: Arguments) {
        super();
    }
    get code(): Code {
        let op: 'invoke_block' | 'invoke' = (!!this.args.block ? 'invoke_block' : 'invoke');
        let block: Code = []
        if (this.args.block) {
            block = this.args.block.code;
        }

        return [
            ...block,
            ...this.args.args.reverse().code,
            ...this.receiver.code,
            ...this.message.code,
            ['call', null],
            [op, this.args.length],
        ];
    }

    inspect() { return [this.receiver.inspect(), this.message.inspect()].join(".") + this.args.inspect() }
}
