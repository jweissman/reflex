import ReflexObject from '../types/ReflexObject';
import { ReflexFunction } from '../types/ReflexFunction';
import { log } from '../util/log';
import { Frame } from '../Frame';
import { Stack } from '../Stack';
import { pop } from './pop';
import { dump } from "../util/dump";
export function call(stack: Stack, frames: Frame[]) {
    let [second, top] = [
        stack[stack.length - 2],
        stack[stack.length - 1]
    ];
    log("CALL -- top: " + top + " second: " + (second) + "(" + typeof second + ")");
    if (second && second instanceof ReflexObject && top && typeof top === 'string') {
        pop(stack);
        pop(stack);
        let receiver = second;
        let method = top;
        let result;
        result = receiver.send(method);
        if (result instanceof ReflexFunction) {
            result.self = receiver;
        }
        stack.push(result);
    } else {
        dump(stack);
        throw new Error("call expects top to be message, second to be recv");
    }
}
