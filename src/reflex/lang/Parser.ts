import chalk from 'chalk';
import fs from 'fs';
import ohm, { Semantics, Dict } from 'ohm-js';
import { tree } from "./ast";
import Tree from './ast/Tree';
import Reflex from '../Reflex';

var contents = fs.readFileSync('./src/reflex/lang/Reflex.ohm');
var grammar = ohm.grammar(contents.toString());
const semantics: Semantics = grammar.createSemantics();
semantics.addAttribute("tree", tree)

export default class Parser {
    trace = Reflex.trace
    analyze(input: string) {
        let ast = this.tree(input);
        let code = ast.code //inspect()
        if (this.trace) {
            console.debug("AST ANALYZE", input, "=>", chalk.blue(ast.inspect()))
        }
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