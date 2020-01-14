import chalk from 'chalk';
import { Instruction, prettyInstruct } from "./Instruction";
import { log } from '../util/log';
import { Frame } from '../Frame';
import { Stack } from '../Stack';
import { dump } from '../util/dump';
let lastStack: Stack = [];
export function trace(message: string, instruction: Instruction, frame: Frame, stack: Stack) {
    let msg = [
        // ...(message ? [chalk.yellow(message)] : []),
        ...(stack.length && stack !== lastStack ? [chalk.gray("stack: ") + dump(stack)] : []),
        prettyInstruct(instruction),
        // chalk.gray("self: ") + frame.self.inspect(),
    ].join("\n");
    lastStack = [...stack];
    log(msg);
}
