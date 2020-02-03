import { prettyCode, prettyValue } from "./vm/instruction/Instruction";
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
            prompt: chalk.gray("> "),
            writer: prettyValue,
            eval: (input: string, _ctx: any, _filename: any, cb: any) => {
                let out = '(nothing)';
                try {
                    out = interpreter.evaluate(input.replace("\n", ""), false);
                }
                catch (e) {
                    if (e.name === 'SyntaxError') {
                        return cb(new repl.Recoverable(e));
                    } else {
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
        server.defineCommand('trace', {
            help: 'Activate code trace',
            action: () => {
                Reflex.config.trace = true;
                console.log(chalk.blue("(trace activated)"));
            }
        });
    }
}
