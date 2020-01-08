import ReflexObject from '../types/ReflexObject';
import { invoke } from './invoke';
import { ret } from './ret';
import { ReflexFunction } from '../types/ReflexFunction';
import { Stack } from '../Stack';
import { Frame } from '../Frame';
import Machine from '../Machine';
export function dispatch(message: string, object: ReflexObject, stack: Stack, frames: Frame[], machine: Machine, doRet: boolean = false) {
    let fn = object.send(message) as ReflexFunction;
    stack.push(fn);
    // stack.push(object) //classRegistry[className])
    // stack.push(message as string)
    // call(stack, frames);
    // let fn = object.send stack[stack.length - 1] as ReflexFunction
    invoke(fn.arity, !!fn.blockParamName, stack, frames, machine.currentProgram, machine);
    if (doRet) {
        ret(stack, frames, machine); //?
    }
}
