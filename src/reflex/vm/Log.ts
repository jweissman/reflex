import chalk from 'chalk';
import Reflex from "../Reflex";

export function log(message: string) {
    if (Reflex && Reflex.trace) {
        console.log(chalk.magentaBright(message));
    }
}