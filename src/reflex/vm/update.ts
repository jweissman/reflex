import assertNever from 'assert-never';
import { Instruction, Code, Stone } from "./Instruction";
import ReflexObject from './types/ReflexObject';
import Tree from '../lang/ast/Tree';
import { log } from './util/log';
import { fail } from './util/fail';
import { pop } from './pop';
import { State } from './State';
import { call } from './call';
import { invoke } from './invoke';
import { compile } from './compile';
import { dump } from './dump';
import { sweep } from './sweep';
import { ret } from './ret';
import { sendEq } from './sendEq';

export function update(state: State, instruction: Instruction, code: Code): State {
    let [op, value] = instruction;
    let { meta, stack, frames } = state;
    let frame = frames[frames.length - 1];
    switch (op) {
        case 'push':
            stack.push(value);
            break;
        case 'pop':
            pop(stack);
            break;
        case 'mark':
            stack.push(new Stone(value as string));
            break;
        case 'sweep':
            sweep(value, stack);
            break;
        case 'call':
            call(stack, frames);
            break;
        case 'ret':
            ret(stack, frames);
            break;
        case 'label': break;
        case 'halt': break;
        case 'invoke':
            invoke(value as number, stack, frames, code, meta);
            break;
        case 'compile':
            compile(value as Tree, stack, meta);
            break;
        case 'local_var_set':
            let key = value as string;
            let top = stack[stack.length - 1];
            if (top instanceof ReflexObject) {
                log(`LOCAL VAR SET ${key}=${top.inspect()}`);
                frame.locals[key] = top;
            }
            else {
                fail("local_var_set expects top is be reflex obj to assign");
            }
            break;
        case 'send':
            let val: string = value as string;
            if (Object.keys(frame.locals).includes(val)) {
                stack.push(frame.locals[val]);
            }
            else {
                let result = frame.self.send(val);
                stack.push(result);
            }
            break;
        case 'send_eq':
            sendEq(value as string, stack);
            break;
        case 'send_or_eq':
            let theKey = value as string;
            log('send or eq -- key: ' + theKey + ' stack: ' + dump(stack));
            if (!frame.self.respondsTo(theKey)) {
                sendEq(value as string, stack);
            }
            break;
        default: assertNever(op);
    }
    return { stack, frames, meta };
}
