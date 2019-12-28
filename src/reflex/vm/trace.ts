import chalk from 'chalk';
import { Instruction, prettyInstruct } from "./Instruction";
import { log } from './util/log';
import { Frame } from './Frame';
import { Stack } from './Stack';
import { dump } from './dump';
let lastStack: Stack = [];
export function trace(message: string, instruction: Instruction, frame: Frame, stack: Stack) {
    let msg = [
        ...(message ? [chalk.yellow(message)] : []),
        prettyInstruct(instruction),
        chalk.gray("self: ") + frame.self.inspect(),
        ...(stack !== lastStack ? [chalk.gray("stack: ") + dump(stack)] : []),
    ].join("\n");
    lastStack = [...stack];
    log(msg);
}
