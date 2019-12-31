import { Frame } from '../Frame';
import { Stack } from '../Stack';
import { ReflexNihil } from '../types/ReflexNihil';
import ReflexClass from '../types/ReflexClass';
import Machine from '../Machine';
import { dump } from '../util/dump';
import { log } from '../util/log';
export function ret(stack: Stack, frames: Frame[], meta: Machine) {
    // log("RETURN")
    let frame = frames[frames.length - 1];
    frames.pop();
    frames.pop();
    if (frame.retValue) {
        log("RETURN retValue: " + frame.retValue)
        stack.push(frame.retValue);
    } else {
        if (stack.length) {
            // leave whatever is there? implicit return
            log("RETURN something on stack, leaving alone: " + dump(stack))
        } else {
            let nil = ReflexClass.makeInstance(meta, ReflexNihil.klass, []);
            stack.push(nil);
            log("RETURN creating nihil: " + dump(stack))
        }
    }
}
