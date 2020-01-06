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
import { ReflexFunction, WrappedFunction } from './types/ReflexFunction';
import { Stack } from './Stack';
import { Frame } from './Frame';

function mark(stack: Stack, value: string) {
    stack.push(new Stone(value));
}

function findFrameWithLocal(key: string, frames: Frame[]) {
    let top = frames[frames.length - 1];
    if (!top.locals[key] && frames.length > 1) {
        for (let i = frames.length-1; i >= 0; i--) {
            let nextFrame = frames[i];
            if (nextFrame.locals[key]) {
                return nextFrame;
            }
        }
    }
    return top
}

export function update(state: State, instruction: Instruction, code: Code): State {
    let [op, value] = instruction;
    let { machine, stack, frames } = state;
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
            ret(stack, frames, machine);
            break;
        case 'label': break;
        case 'halt': break;
        case 'compile':
            compile(value as Tree, stack, machine);
            break;
        case 'local_var_get':
            let frameLoc: Frame = findFrameWithLocal(value as string, frames);
            let variable = frameLoc.locals[value as string]
            if (variable) {
                stack.push(variable)
            } else {
                throw new Error("no such local variable '" + value as string)
            }
            break;
        case 'local_var_set':
            let key = value as string;
            let top = stack[stack.length - 1];
            pop(stack)
            if (top instanceof ReflexObject) {
                // log(`LOCAL VAR SET ${key}=${top.inspect()}`);
                let localFrame: Frame = findFrameWithLocal(key, frames);
                localFrame.locals[key] = top;
            } else {
                fail("local_var_set expects top is be reflex obj to assign");
            }
            break;
        case 'local_var_or_eq':
            let k = value as string;
            let t = stack[stack.length - 1];
            pop(stack)
            if (t instanceof ReflexObject) {
                let localFrame: Frame = findFrameWithLocal(k, frames);
                if (localFrame === frame &&
                    !frame.locals[k]) {
                    // log(`LOCAL VAR OR EQ -- assign ${k}=${t.inspect()}`);
                    frame.locals[k] = t;
                }
            } else {
                fail("local_var_set expects top is reflex obj to assign");
            }
            break;
        case 'bare':
            let v: string = value as string;
            let localFrame = findFrameWithLocal(v, frames);
            if (Object.keys(localFrame.locals).includes(v)) {
                stack.push(localFrame.locals[v]);
            } else if (v === 'self') {
                // log("bare self fell back to frame self -- " + frame.self.inspect())
                stack.push(frame.self.self)
            } else if (v === 'yield') {
                if (frame.currentMethod && frame.block) {
                    let yieldFn = new WrappedFunction('yielder', (...args: ReflexObject[]) => {;
                        frame.currentMethod!.frame = { ...frame };
                        ret(stack, frames, machine);
                        let fn = frame.block as ReflexFunction;
                        // log("yield to block " + fn)
                        args.forEach(arg => stack.push(arg))
                        stack.push(fn);
                        invoke(fn.arity, !!fn.blockParamName, stack, frames, machine.currentProgram, machine)
                    });
                    stack.push(yieldFn)
                } else {
                    throw new Error("tried to yield from outermost scope or without a block on frame?")
                }
            } else if (v === 'super') {
                stack.push(frame.self.super)
            } else {
                // let dispatched = frame.self.send(value as string)
                // stack.push(dispatched);
                stack.push(frame.self)
                stack.push(value as string)
                call(stack, frames)
            }
            break;
        case 'invoke_block':
            invoke(value as number, true, stack, frames, code, machine);
            break;
        case 'invoke':
            invoke(value as number, false, stack, frames, code, machine);
            break;
        case 'send':
            let val: string = value as string;
            let result = frame.self.send(val);
            stack.push(result);
            break;
        case 'send_eq':
            sendEq(value as string, stack, frames, code, machine);
            break;
        case 'send_or_eq':
            let theKey = value as string;
            log('send or eq -- key: ' + theKey + ' stack: ' + dump(stack));
            if (!frame.self.respondsTo(theKey)) {
                sendEq(value as string, stack, frames, code, machine);
            }
            break;

        default: assertNever(op);
    }
    return { stack, frames, machine: machine };
}
