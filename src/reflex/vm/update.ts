import assertNever from 'assert-never';
import { Instruction, Code } from "./instruction/Instruction";
import { Stone } from "./instruction/Stone";
import ReflexObject from './types/ReflexObject';
import Tree from '../lang/ast/Tree';
import { log } from './util/log';
import { fail } from './util/fail';
import { pop } from './instruction/pop';
import { State } from './State';
import { call } from './instruction/call';
import { invoke } from './instruction/invoke';
import { compile } from './instruction/compile';
import { dump } from './util/dump';
import { sweep } from './instruction/sweep';
import { ret } from './instruction/ret';
import { sendEq } from './instruction/sendEq';
import { ReflexFunction } from './types/ReflexFunction';
import { Stack } from './Stack';

function mark(stack: Stack, value: string) {
    stack.push(new Stone(value));
}

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
            mark(stack, value as string);
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
        case 'local_var_get':
            let variable = frame.locals[value as string]
            if (variable) {
                stack.push(variable)
            } else {
                throw new Error("no such local variable '" + value as string)
            }
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
        case 'local_var_or_eq':
            let k = value as string;
            let t = stack[stack.length - 1];
            if (t instanceof ReflexObject) {
                if (!frame.locals[k]) {
                    log(`LOCAL VAR OR EQ -- assign ${k}=${t.inspect()}`);
                    frame.locals[k] = t;
                }
            }
            else {
                fail("local_var_set expects top is reflex obj to assign");
            }
            break;
        case 'bare':
            let v: string = value as string;
            if (Object.keys(frame.locals).includes(v)) {
                stack.push(frame.locals[v]);
            } else if (v === 'self') {
                stack.push(frame.self)
            } else {
                throw new Error("bareword " + v + " not self/found in locals")
            }
            break;
        case 'barecall':
            let fn;
            if (Object.keys(frame.locals).includes(value as string)) {
                fn = frame.locals[value as string]
            } else {
                fn = frame.self.send(value as string);
            }
            if (fn instanceof ReflexFunction) {
                stack.push(fn);
                invoke(fn.arity, stack, frames, meta.currentProgram, meta)
            } else {
                throw new Error("tried to call non-fn")
            }
            break;
        case 'send':
            let val: string = value as string;
            let result = frame.self.send(val);
            stack.push(result);
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
