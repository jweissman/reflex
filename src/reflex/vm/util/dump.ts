import chalk from 'chalk';
import ReflexObject from '../types/ReflexObject';
import Tree from '../../lang/ast/Tree';
import { Stack } from '../Stack';
export function dump(stack: Stack) {
    return stack.map(it => it ? ((it instanceof ReflexObject || it instanceof Tree) ? chalk.blue(it.inspect()) : chalk.blueBright(it.toString()))
        : 'null');
}
