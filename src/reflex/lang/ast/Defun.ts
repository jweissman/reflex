import Tree from "./Tree";
import { Code, Instruction } from "../../vm/instruction/Instruction";
import { Message } from "./Message";
import { Sequence } from "./Sequence";

// type Function
export class Defun extends Tree {
    compileOnly: boolean = false;
    constructor(public name: Message, public params: Sequence, public block: Tree) { super(); }
    inspect(): string {
        return `defun(${this.name.inspect()}, ${this.params.inspect()} => ${this.block.inspect()})`;
    }
    get code(): Code {
        let compile: Instruction = ['compile', this];
        let send: Code = this.compileOnly ? [] : [
            // ['send', 'self'],
            ['local_var_set', this.name.key]
        ];
        return [
            compile,
            ...send
        ]
    }

    get shell(): Code {
        return [
            ...this.block.code,
            ['ret', null],
        ]
    }
}
