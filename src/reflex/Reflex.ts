import Parser from "./lang/Parser";
import Machine from "./vm/Machine";
import { Code } from "./vm/instruction/Instruction";
import { Configuration } from "./Configuration";

const preamble = `
class Class { isDescendantOf(other) { other.isAncestorOf(self) } };
nil = Nihil.new();

/***
 * Boolean
 * 
 * The class of truth-values.
 */
class Boolean {
    //true() { self };
    false() { self.negate(self.true()) };
    eq(other) { self.isInstanceOf(other.class) };
    neq(other) { self.eq(other).negate() };
};
class Truth < Boolean { true() { true }; negate() { false }; };
class Falsity < Boolean { true() { false }; negate() { true }; };
true = Truth.new();
false = Falsity.new();

/********************************
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
    machine: Machine = new Machine()

    constructor() {
        // log("EVAL PREAMBLE")
        this.evaluate(preamble);
    }

    evaluate(input: string) {
        let code: Code = this.parser.analyze(input)
        // log("RUN CODE", prettyCode(code))
        this.machine.run(code)
        let result = this.machine.top
        this.machine.stack = [];
        if (result == null) { return 'nothing' }
        return result;
    }

    hardReset() { this.machine = new Machine() }

    repl() { const {Repl} = require('./Repl'); (new Repl()).interact(this); }
}