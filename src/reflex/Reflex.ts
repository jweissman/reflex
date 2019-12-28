import Parser from "./lang/Parser";
import Machine from "./vm/Machine";
import { Code, prettyCode } from "./vm/Instruction";
import { Configuration } from "./Configuration";
import chalk from 'chalk';

// const preamble = `
// class Object {
//     inspect() { self.class }
// }
// `;

export default class Reflex {
    static config: Configuration = new Configuration()
    static get trace(): boolean { return this.config.trace }
    parser: Parser = new Parser();
    machine: Machine = new Machine()

    // constructor() {
    //     // this.evaluate(preamble)
    // }
    evaluate(input: string) {
        let code: Code = this.parser.analyze(input)
        this.machine.run(code)
        let result = this.machine.top
        this.machine.stack = [];
        if (result == null) { return 'nothing' }
        return result;
    }

    hardReset() { this.machine = new Machine() }

    repl() {
        // throw new Error("Method not implemented.");
        const clear = require('clear');
        const figlet = require('figlet');
        const repl = require('repl');
        clear();
        console.log(
            chalk.green(figlet.textSync('reflex'))
        )
        console.log("\n" + chalk.blue("Reflex") + chalk.gray("Repl"));
        const server = repl.start({
            prompt: "\n(refl) ",
            eval: (input: string, _ctx: any, _filename: any, cb: any) => {
                let out = '(nothing)';
                try {
                    out = this.evaluate(input).toString();
                    if (out === undefined) { out = '(no-result)' };
                } catch (e) {
                    if (e.name === 'SyntaxError') {
                        return cb(new repl.Recoverable(e))
                    } else {
                        throw e;
                    }
                }
                cb(null, out)
            }
        })

        server.defineCommand('code', {
            help: 'Echo current program instructions',
            action: () => { console.log(prettyCode(this.machine.currentProgram)) }
        })

        // server.defineCommand('stack', {
        //     help: 'Dump current stack elements',
        //     action: () => { console.log(interpreter.machine.stack) }
        // })

        server.defineCommand('trace', {
            help: 'Activate code trace',
            action: () => {
                Reflex.config.trace = true;
                console.log(chalk.blue("(trace activated)"));
            }
        })

        // server.defineCommand('notrace', {
        //     help: 'Deactivate code trace',
        //     action: () => {
        //         interpreter.trace = false;
        //         console.log(chalk.blue("(trace deactivated)"));
        //     }
        // })

    }
}