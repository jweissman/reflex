import Parser from "./lang/Parser";
import Machine from "./vm/Machine";
import { Code, prettyCode } from "./vm/instruction/Instruction";
import { Configuration } from "./Configuration";
import Tree from "./lang/ast/Tree";
import ReflexObject from "./vm/types/ReflexObject";
import { castReflexToJavascript } from "./vm/instruction/invoke";
// import { log } from "./vm/util/log";

// import fs from 'fs';

// @ts-ignore
// import * as Preamble from "./Preamble.reflex"
const preamble = //Preamble.default
`
class Class {
   isDescendantOf(other) { other.isAncestorOf(self) }
};
nil = Nihil.new();

/*
* Boolean
* 
* The class of truth-values.
*/
class Boolean {
   false() { self.negate(self.true()) };
   eq(other) { self.isInstanceOf(other.class) };
   neq(other) { self.eq(other).negate() };
};
class Truth < Boolean { true() { true }; negate() { false }; };
class Falsity < Boolean { true() { false }; negate() { true }; };
true = Truth.new();
false = Falsity.new();

/*
* Number
* 
* The class of numeric values
*/
class Number {}

// wire up main so it can define instance methods on itself...
self.defineMethod = meta.defineMethod
`;

export default class Reflex {
    static config: Configuration = new Configuration()
    static get trace(): boolean { return this.config.trace }
    parser: Parser = new Parser();
    machine: Machine = new Machine(this)

    constructor() {
    //     // console.log("EVAL PREAMBLE: " + preamble)
    //     this.evaluate(preamble);
        this.evaluate("Kernel.import 'preamble'");
    }

    // how does this work with the web?
    // maybe we can compile down a tiny bytecode rep after parsing everything...
    // import() {
        // let lines: [Tree, Code][] = this.parser.analyze(input)
        // if (isNode) { }
        // let contents = fs.readFileSync(filename).toString();
        // this.evaluate(contents)
    // }

    evaluate(input: string) {
        // console.log("EVAL: " + input)
        // input.split("\n")
        let lines: [Tree, Code][] = this.parser.analyze(input)

        // log("RUN CODE", prettyCode(code))
        lines.forEach(([tree,code]) => {
            // console.log("INTERPRET: " + tree.inspect());
            // console.log("CODE: " + prettyCode(code));
            this.machine.run(code)
        })
        this.machine.halt(); //ed = true;
        let result = this.machine.top
        this.machine.stack = [];
        if (result == null) { return 'nothing' }
        else if (result instanceof ReflexObject) {
            let cast = castReflexToJavascript(result);
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