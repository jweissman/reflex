import Tree from "./Tree";
import { Code, Instruction } from "../../vm/Instruction";
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
        // compile block
        // throw new Error("Defun.code -- Method not implemented.");
        let compile: Instruction = ['compile', this];
        let send: Code = this.compileOnly ? [] : [['send_eq', this.name.key]];
        return [
            compile,
            ...send
        ]
    }

    get shell(): Code {
        return [
            // load params??
            // ['label', this.name.key],
            ...this.block.code,
            ['ret', null],
            // ret
            // ['compile', this],
            // ['store', this.name.key]
        ]
    }
}
