import ReflexObject from '../types/ReflexObject';
import { invoke } from './invoke';
import { ret } from './ret';
import { ReflexFunction, WrappedFunction } from '../types/ReflexFunction';
import { Stack } from '../Stack';
import { Frame } from '../Frame';
import Machine from '../Machine';
import { log } from '../util/log';

// why is this not the same as push message / call / invoke ???
export function dispatch(message: string, object: ReflexObject, stack: Stack, frames: Frame[], machine: Machine, doRet: boolean = false) {
    log("DISPATCH " + message + " TO " + object.inspect())
    let fn = object.send(message) as ReflexFunction;
    stack.push(fn);
    let arity = fn.arity;
    // if (fn instanceof WrappedFunction) { arity -= 1; }
    log("DISPATCH " + message + " TO " + object.inspect() + " -- INVOKE " + fn.inspect() + " with ARITY " + arity)
    invoke(arity, !!fn.blockParamName, stack, frames, machine.currentProgram, machine);
    if (doRet) {
        ret(stack, frames, machine);
    }
}
