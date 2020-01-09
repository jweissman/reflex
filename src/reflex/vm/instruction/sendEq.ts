import ReflexObject from '../types/ReflexObject';
import { fail } from '../util/fail';
import { pop } from './pop';
import { Stack } from '../Stack';
import { Frame } from '../Frame';
import { Code } from './Instruction';
import Machine from '../Machine';
import { dump } from '../util/dump';
import { log } from '../util/log';
export function sendEq(value: string, stack: Stack, frames: Frame[], code: Code, machine: Machine) {
    log('send eq -- ' + value + ' / stack: ' + dump(stack));
    let k = value as string;
    let recv = stack[stack.length - 1];
    pop(stack);
    let obj = stack[stack.length - 1];
    pop(stack);
    if (obj instanceof ReflexObject) {
        if (recv instanceof ReflexObject) {
            if (frames[frames.length - 1].self === recv) {
                log(`SEND EQ -- SELF SET ${recv.inspect()}.${k}=${obj.inspect()}`);
                recv.set(k, obj)
            } else {
                throw new Error("can't set attrs on nonself")
            }
        } else {
            fail("send_eq expects top to be receiver (got: " + recv + ")")
        }
    } else {
        fail("send_eq expects second to be object to assign (got: " + obj + ")");
    }
}
