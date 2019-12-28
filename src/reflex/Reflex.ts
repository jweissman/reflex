import Parser from "./lang/Parser";
import Machine from "./vm/Machine";
import { Code } from "./vm/Instruction";
import { Configuration } from "./Configuration";

export default class Reflex {
    static config: Configuration = new Configuration()
    static get trace(): boolean { return this.config.trace }
    parser: Parser = new Parser();
    machine: Machine = new Machine()
    evaluate(input: string) {
        let code: Code = this.parser.analyze(input)
        // this.machine.mark('eval')
        this.machine.run(code)
        let result = this.machine.top
        // this.machine.stack.pop();
        this.machine.stack = [];
        // this.machine.sweep('eval')
        if (result == null) { return 'nothing' }
        return result;
    }

    hardReset() { this.machine = new Machine() }
}