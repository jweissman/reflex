import { prettyCode } from "./vm/instruction/Instruction";
import chalk from 'chalk';
import Reflex from "./Reflex";
export class Repl {
    interact(interpreter: Reflex) {
        const clear = require('clear');
        const figlet = require('figlet');
        const repl = require('repl');
        if (!Reflex.config.trace) {
            clear();
        }
        console.log(chalk.green(figlet.textSync('reflex')));
        console.log("\n" + chalk.blue("Reflex") + chalk.cyan("Repl"));

        const server = repl.start({
            prompt: chalk.gray("\n(reflex) "),
            eval: (input: string, _ctx: any, _filename: any, cb: any) => {
                let out = '(nothing)';
                try {
                    out = (interpreter.evaluate(input));
                    if (out === undefined) {
                        out = '(no-result)';
                    }
                    ;
                }
                catch (e) {
                    if (e.name === 'SyntaxError') {
                        return cb(new repl.Recoverable(e));
                    }
                    else {
                        throw e;
                    }
                }
                cb(null, out);
            }
        });
        server.defineCommand('code', {
            help: 'Echo current program instructions',
            action: () => { console.log(prettyCode(interpreter.machine.activeProgram)); }
        });
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
        });
    }
}
