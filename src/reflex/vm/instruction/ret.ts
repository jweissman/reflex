import { Frame } from '../Frame';
import { Stack } from '../Stack';
import { ReflexNihil } from '../types/ReflexNihil';
import { makeReflexObject } from "../types/makeReflexObject";
import Machine from '../Machine';

export function ret(stack: Stack, frames: Frame[], machine: Machine) {
    let frame = frames[frames.length - 1];
    frames.pop();
    frames.pop();
    if (frame.retValue) {
        stack.push(frame.retValue);
    } else {
        if (stack.length) {
            // leave whatever is there? implicit return
        } else {
            let nil = makeReflexObject(machine, ReflexNihil.klass, []);
            stack.push(nil);
        }
    }
}
