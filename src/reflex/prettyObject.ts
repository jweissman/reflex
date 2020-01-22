import util from 'util';
import chalk from 'chalk';
import ReflexObject from "./vm/types/ReflexObject";
import { ReflexString } from "./vm/types/ReflexString";
import { ReflexNumber } from "./vm/types/ReflexNumber";
import { ReflexArray } from "./vm/types/ReflexArray";
import ReflexClass from "./vm/types/ReflexClass";
import { ReflexFunction } from "./vm/types/ReflexFunction";
export function prettyObject(object: ReflexObject): string {
    if (object instanceof ReflexString) {
        return chalk.green('"') + chalk.green(object.value) + chalk.green('"');
    }
    else if (object instanceof ReflexClass) {
        return chalk.blue(object.name);
    }
    else if (object instanceof ReflexNumber) {
        return chalk.magenta(object.value);
    }
    else if (object.className === 'Range') {
        return chalk.magenta(object.get('start')) + chalk.gray("..") + chalk.magenta(object.get('stop'));
    }
    else if (object.className === 'Truth') {
        return chalk.yellow('true')
    }
    else if (object.className === 'Falsity') {
        return chalk.yellow('false')
    }
    else if (object.className === 'Nihil') {
        return chalk.gray('nil')
    }
    else if (object instanceof ReflexArray) {
        return chalk.white('[') + object.items.flatMap(item => prettyObject(item)).join(chalk.white(', ')) + chalk.white(']');
    }
    else if (object instanceof ReflexFunction) {
        if (object.source) {
            return chalk.blue(object.source);
        }
        else {
            return chalk.yellow(object.name);
        }
    }
    else {
        if (object.inspect) {
            return chalk.yellow(object.inspect());
        }
        else {
            // throw new Error("Called pretty obj on not an object: " + object + " / " + util.inspect(object));
            if (object.className) {
                return chalk.red(object + "("+ object.className +"??");
            }
            return chalk.red(object + "??");
        }
    }
}
