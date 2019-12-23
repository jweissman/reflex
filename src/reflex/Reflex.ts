import Parser from "./lang/Parser";
import Machine from "./vm/Machine";
import { Code } from "./vm/Instruction";

export default class Reflex {
    static trace: boolean = false
    parser: Parser = new Parser();
    machine: Machine = new Machine()
    evaluate(input: string) {
        let code: Code = this.parser.analyze(input)
        this.machine.run(code)
        let result = this.machine.top
        this.machine.stack.pop();
        if (result == null) { return 'nothing' }
        return result;
    }
}