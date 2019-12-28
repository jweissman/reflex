import ReflexObject from './types/ReflexObject';
import { log } from './util/log';
import { fail } from './util/fail';
import { pop } from './pop';
import { dump } from './dump';
import { Stack } from './Stack';
export function sendEq(value: string, stack: Stack) {
    log('send eq -- stack: ' + dump(stack));
    let k = value as string;
    let recv = stack[stack.length - 1];
    pop(stack);
    let obj = stack[stack.length - 1];
    if (obj instanceof ReflexObject && recv instanceof ReflexObject) {
        log(`SEND EQ ${recv.inspect()}.${k}=${obj.inspect()}`);
        recv.set(k, obj);
    }
    else {
        fail("send_eq expects top to be receiver, second to be object to assign");
    }
}
