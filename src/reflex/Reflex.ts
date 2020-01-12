import Parser from "./lang/Parser";
import Machine from "./vm/Machine";
import { Code } from "./vm/instruction/Instruction";
import { Configuration } from "./Configuration";
import Tree from "./lang/ast/Tree";
import ReflexObject from "./vm/types/ReflexObject";
import { Converter } from "./vm/Converter";

export default class Reflex {
    static config: Configuration = new Configuration()
    static get trace(): boolean { return this.config.trace }
    parser: Parser = new Parser();
    machine: Machine = new Machine(this)

    constructor() {
        this.evaluate("Kernel.import 'preamble'");
    }

    evaluate(input: string) {
        let lines: [Tree, Code][] = this.parser.analyze(input)
        let result: any;
        lines.forEach(([_tree,code]) => {
            this.machine.run(code)
            result = this.machine.top
            this.machine.reset();
        })
        this.machine.halt();
        this.machine.reset(); // = [];
        if (result == null) { return 'nothing' }
        else if (result && result instanceof ReflexObject) {
            let cast = Converter.castReflexToJavascript(result);
            if (cast instanceof ReflexObject) {
                return cast.inspect()
            } else {
                return cast;
            }
        }
        else { return result; }

    }

    hardReset() { this.machine = new Machine(this) }
    repl() { const {Repl} = require('./Repl'); (new Repl()).interact(this); }
}