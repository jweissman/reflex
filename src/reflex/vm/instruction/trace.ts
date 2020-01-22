import chalk from 'chalk';
import { Instruction, prettyInstruct } from "./Instruction";
import { log, debug } from '../util/log';
import { Frame } from '../Frame';
import { Stack } from '../Stack';
import { dump } from '../util/dump';
let lastStack: Stack = [];
// let lastMethod: string | undefined = '[none]';
const traceDepth = 3

export function trace(message: string, instruction: Instruction, frames: Frame[]) {//}, stack: Stack) {
    let frame = frames[frames.length - 1]
    let method = frame.currentMethod?.name;
    let stack = frame.stack
    // if (frames.length > 1) {
    //     // construct frame list
    //     method = frames.flatMap(frame =>
    //         frame.currentMethod?.source?.length && frame.currentMethod?.source?.length < 35
    //             ? frame.currentMethod?.source
    //             : chalk.green(frame.currentMethod?.name)
    //     ).reverse().join(chalk.gray(" in "))

    // }

    let msg: string[] = [
        // ...(message ? [chalk.yellow(message)] : []),
        // ...(stack.length && stack !== lastStack ? [chalk.gray("stack: ") + dump(stack)] : []),
        // ...(method !== lastMethod
        //     ? [(chalk.gray("current method: ") + method)]
        //     : []
        // ),
        // prettyInstruct(instruction),
        // chalk.gray("self: ") + frame.self.inspect(),
    ]//.join("\n");
    lastStack = [...stack];
    // lastMethod = method;
    if (msg.length && frames.length < traceDepth) debug(msg.join("\n"), frames);
}
