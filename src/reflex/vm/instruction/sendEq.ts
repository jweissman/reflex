import ReflexObject from '../types/ReflexObject';
import { log } from '../util/log';
import { fail } from '../util/fail';
import { pop } from './pop';
import { dump } from '../util/dump';
import { Stack } from '../Stack';
import { invoke } from './invoke';
import { Frame } from '../Frame';
import { Code } from './Instruction';
import Machine from '../Machine';
export function sendEq(value: string, stack: Stack, frames: Frame[], code: Code, machine: Machine) {
    log('send eq -- stack: ' + dump(stack));
    let k = value as string;
    let recv = stack[stack.length - 1];
    pop(stack);
    let obj = stack[stack.length - 1];
    if (obj instanceof ReflexObject && recv instanceof ReflexObject) {
        if (frames[frames.length - 1].self === recv) {
            // just set?
            log(`SEND EQ -- SELF SET ${recv.inspect()}.${k}=${obj.inspect()}`);
            recv.set(k, obj)
        } else {
            throw new Error("can't set attrs on nonself")
            // log(`SEND EQ ${recv.inspect()}.${k}=${obj.inspect()}`);
            // stack.push(obj)
            // recv.send(`${k}=`); //, obj);
            // invoke(1, false, stack, frames, code, machine)
        }
    } else {
        fail("send_eq expects top to be receiver, second to be object to assign");
    }
}
