import Parser from "./lang/Parser";
import Machine from "./vm/Machine";
import { Code } from "./vm/Instruction";
import { Configuration } from "./Configuration";
import { Repl } from "./Repl";

// const preamble = '';
//`
//class Object {};
//class Class {};
//class Function {};
//`;

export default class Reflex {
    static config: Configuration = new Configuration()
    static get trace(): boolean { return this.config.trace }
    parser: Parser = new Parser();
    machine: Machine = new Machine()

    // constructor() { this.evaluate(preamble); }

    evaluate(input: string) {
        let code: Code = this.parser.analyze(input)
        this.machine.run(code)
        let result = this.machine.top
        this.machine.stack = [];
        if (result == null) { return 'nothing' }
        return result;
    }

    hardReset() { this.machine = new Machine() }

    repl() { (new Repl()).interact(this); }
}