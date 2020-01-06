import Parser from "./lang/Parser";
import Machine from "./vm/Machine";
import { Code, prettyCode } from "./vm/instruction/Instruction";
import { Configuration } from "./Configuration";

 const preamble = `
class Class {
    isDescendantOf(other) { other.isAncestorOf(self) }
};
nil = Nihil.new();
class Boolean {
    false() {self.negate(self.true())};
    eq(other) { self.isInstanceOf(other.class)};
};
class Truth < Boolean {
    true() { Truth.new() };
    negate() { Falsity.new() };
};
class Falsity < Boolean {
    true() { Falsity.new() };
    negate() { Truth.new() };
};
true = Truth.new();
false = Falsity.new();
instanceEval { self.defineMethod = meta.defineMethod };
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