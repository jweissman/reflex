import chalk from 'chalk';
import Reflex from "../../Reflex";
import { Frame } from '../Frame';

export function log(message: string) {
    if (Reflex && Reflex.trace) {
        process.stdout.write(chalk.white(message) + "\n"); //chalk.magentaBright(message));
    }
}

// let traceDepth = 2
export function debug(message: string, frames: Frame[]) {
    if (Reflex && Reflex.trace && frames.length < Reflex.config.traceDepth) {
        let msg = chalk.white(message);
        if (frames) {
            msg = chalk.black(
                frames[frames.length - 1].currentMethod?.name + ":"
            ).padEnd(24) + "\t" + msg; //Invoke wrapped fn " + chalk.green(top) + " on " + prettyValue(self) + " with args: " + args.map(arg => prettyValue(arg)).join(","))
        }
        for (let i = 0; i<frames.length-1; i++) { msg = "  " + msg }
        process.stdout.write(msg.padStart(10) + "\n"); //chalk.magentaBright(message));
    }
}