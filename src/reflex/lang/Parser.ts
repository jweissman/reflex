import chalk from 'chalk';
import fs from 'fs';
import ohm, { Semantics, Dict } from 'ohm-js';
import { tree } from "./ast";
import Tree from './ast/Tree';
import { Program } from './ast/Program';
import { Code } from '../vm/instruction/Instruction';
import { log } from '../vm/util/log';

var contents = fs.readFileSync('./src/reflex/lang/Reflex.ohm');
var grammar = ohm.grammar(contents.toString());
const semantics: Semantics = grammar.createSemantics();
semantics.addAttribute("tree", tree)

export default class Parser {
    // trace = Reflex.trace
    analyze(input: string): [Tree, Code][] {
        let ast: Program = this.tree(input) as Program;
        let code: [Tree, Code][] = ast.lines.map(line => [line, line.code]) //inspect()
        log("PARSE: "+input+"=>"+chalk.blue(ast.inspect()))
        return code
    }

    private tree(input: string): Tree {
        return this.semanteme(input).tree;
    }

    private semanteme(input: string): Dict {
        if (input.trim().length === 0) { return []; }
        let match = grammar.match(input.trim());
        if (match.succeeded()) {
            let semanteme: Dict = semantics(match);
            return semanteme;
        } else {
            if (match.message) {
                console.debug(chalk.blue(match.message))
            }
            throw new SyntaxError(match.shortMessage)
        }
    }
}