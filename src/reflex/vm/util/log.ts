import chalk from 'chalk';
import Reflex from "../../Reflex";

export function log(message: string) {
    if (Reflex && Reflex.trace) {
        process.stdout.write(chalk.white(message) + "\n"); //chalk.magentaBright(message));
    }
}

export function debug(message: string) {
    if (Reflex && Reflex.trace) {
        process.stdout.write(chalk.gray(message) + "\n"); //chalk.magentaBright(message));
    }
}