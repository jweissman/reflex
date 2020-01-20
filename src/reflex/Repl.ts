import { prettyCode } from "./vm/instruction/Instruction";
import chalk from 'chalk';
import Reflex from "./Reflex";
import ReflexObject from "./vm/types/ReflexObject";
import { prettyObject } from "./prettyObject";
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
            writer: (out: ReflexObject) => prettyObject(out),
            eval: (input: string, _ctx: any, _filename: any, cb: any) => {
                let out = '(nothing)';
                try {
                    out = // prettyObject(
                        interpreter.evaluate(input, false);
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
        // server.defineCommand('slow', {
        //     help: 'Dump current stack elements',
        //     action: () => { console.log('slowdown'); interpreter.machine.delaySecs=1.0; }
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
