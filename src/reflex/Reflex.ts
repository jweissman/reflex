import Parser from "./lang/Parser";
import Machine from "./vm/Machine";
import { Code } from "./vm/instruction/Instruction";
import { Configuration } from "./Configuration";
import Tree from "./lang/ast/Tree";
import ReflexObject from "./vm/types/ReflexObject";
import { Converter } from "./vm/Converter";
import { Value } from "./vm/instruction/Value";

export default class Reflex {
    static config: Configuration = new Configuration()
    static get trace(): boolean { return this.config.trace }
    parser: Parser = new Parser();
    machine: Machine = new Machine(this)
    get tracedOutput(): string[] { return this.machine.tracedOutput; };

    constructor() { this.evaluate("Kernel.import 'preamble'"); }


    evaluate(input: string, castResult: boolean = false) {
        let lines: [Tree, Code][] = this.parser.analyze(input)
        lines.forEach(([_tree,code]) => {
            this.machine.run(code)
            this.lastResult = this.machine.top
            this.machine.reset();
        })
        this.machine.halt();
        this.machine.reset(); // = [];
        if (castResult) {
            return this.convertedResult;
        }
    }

    private lastResult: Value = null;
    get convertedResult(): any {
        let result = this.lastResult
        if (result == null) { return 'nothing' }
        else if (result && result instanceof ReflexObject) {
            // let inspectedResult = //result.inspect() 
                // this.machine.dispatch(result, 'inspect')
            let cast = Converter.castReflexToJavascript(result);
            if (cast instanceof ReflexObject) {
                // this.machine.controller.dispatch(cast, 'inspect'); //cast.inspect()
                this.machine.run([
                    ['push', cast],
                    ['push', 'inspect'],
                    ['call', null],
                    ['invoke', 0],
                ])
                this.lastResult = this.machine.top
                this.machine.reset();
                return this.convertedResult
            } else {
                return cast;
            }
            // return cast
        }
        else { return result; }

    }

    hardReset() { this.machine = new Machine(this) }
    repl() { const {Repl} = require('./Repl'); (new Repl()).interact(this); }
}