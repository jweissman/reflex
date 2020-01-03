import Tree from "./Tree";
import { Code, Instruction } from "../../vm/instruction/Instruction";
import { Message } from "./Message";
import { Sequence } from "./Sequence";
import { Parameter } from "./Parameter";
import { SendMethodCall } from "./SendMethodCall";
import { Bareword } from "./Bareword";
import { Arguments, Argument } from "./Arguments";
import { FunctionLiteral } from "./FunctionLiteral";

// type Function
export class Defun extends Tree {
    compileOnly: boolean = false;
    constructor(public name: Message, public params: Sequence<Parameter>, public block: Tree) { super(); }
    inspect(): string {
        return `${this.name.inspect()}(${this.params.inspect()} ${this.block.inspect()})`;
    }
    get code(): Code {
        let structure = new SendMethodCall(
          new Bareword('self'), new Message("defineMethod"),
          new Arguments(new Sequence([new Argument(this.name), new Argument(
            new FunctionLiteral(this.params, this.block)
          )]))
        )
        return structure.code
    }

    get shell(): Code {
        return [
            ...this.block.code,
            ['ret', null],
        ]
    }
}
