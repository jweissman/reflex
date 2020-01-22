import chalk from 'chalk';
import ReflexObject from '../types/ReflexObject';
import Tree from '../../lang/ast/Tree';
import { Stack } from '../Stack';
import { prettyObject } from '../../prettyObject';
import { Value } from '../instruction/Value';
import { prettyValue } from '../instruction/Instruction';

// function prettyValue(it: Value) {
//     if (it instanceof ReflexObject) {
//         return prettyObject(it)
//     } else if (it instanceof Tree) {
//         return chalk.blue(it.inspect())
//     } else if (it === null) {
//         return chalk.red("null")
//     } else {
//         return it.toString() //chalk.black(it.toString())
//     }
// }

export function dump(stack: Stack) {
    return stack.map(it => prettyValue(it))
}
