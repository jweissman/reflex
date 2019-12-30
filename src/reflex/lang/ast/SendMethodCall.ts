import Tree from "./Tree";
import { Code } from "../../vm/instruction/Instruction";
import { Arguments } from "./Arguments";
import { PipedBlock } from "./PipedBlock";

export class SendMethodCall extends Tree {
    constructor(public receiver: Tree, public message: Tree, public args: Arguments) {
        super();
    }
    get code(): Code {
        let theArgs = this.args;
        let op: 'invoke_block' | 'invoke' = (!!this.args.block ? 'invoke_block' : 'invoke');
        let block: Code = []
        if (this.args.block && this.args.block instanceof PipedBlock) {
            block = [
                ...this.args.block.code,
            ];
        }

        return [
            ...block,
            ...theArgs.args.reverse().code,
            ...this.receiver.code,
            ...this.message.code,
            ['call', null],
            [op, theArgs.args.length],
        ];
    }

    inspect() { return [this.receiver.inspect(), this.message.inspect()].join(".") + this.args.inspect() }
}
