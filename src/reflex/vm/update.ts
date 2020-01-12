import assertNever from 'assert-never';
import { Instruction, Code, indexForLabel } from "./instruction/Instruction";
import ReflexObject from './types/ReflexObject';
import Tree from '../lang/ast/Tree';
import { log, debug } from './util/log';
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
import { Frame } from './Frame';
import { hasLocal } from './instruction/hasLocal';
import { getLocal } from './instruction/getLocal';
import { mark } from './instruction/mark';
import { findFrameWithLocal } from './instruction/findFrameWithLocal';
import { dispatch } from './instruction/dispatch';
import { Value } from './instruction/Value';
import { Stack } from './Stack';

export function push(object: Value, stack: Stack) {
    if (object === undefined) {
        throw new Error("Won't push undefined onto stack")
    } else if (object === null) {
        throw new Error("Won't push raw null onto stack")
    } else {
        stack.push(object)
    }
}

export function update(state: State, instruction: Instruction, code: Code): State {
    let [op, value] = instruction;
    let { machine, stack, frames } = state;
    let frame = frames[frames.length - 1];
    let top = stack[stack.length - 1];
    switch (op) {
        case 'push':
            push(value, stack);
            //stack.push(value);
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
            // let frameLoc: Frame = findFrameWithLocal(value as string, frames);
            // let variable = frameLoc.locals[value as string]
            if (hasLocal(value as string, frames)) {
                stack.push(getLocal(value as string, frames))
            } else {
                console.log("LOCAL VAR GET", value)
                throw new Error("no such local variable '" + value as string + "'")
            }
            break;
        case 'local_var_set':
            let key = value as string;
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
            if (hasLocal(v, frames)) {
                stack.push(getLocal(v, frames));
            } else if (v === 'yield') {
                if (frame.currentMethod && frame.block) {
                    let yieldFn = new WrappedFunction('yielder', (...args: ReflexObject[]) => {;
                        frame.currentMethod!.frame = { ...frame };
                        ret(stack, frames, machine);
                        let fn = frame.block as ReflexFunction;
                        // log("yield to block " + fn)
                        args.forEach(arg => stack.push(arg))
                        stack.push(fn);
                        invoke(fn.arity, !!fn.blockParamName, stack, frames, machine.activeProgram, machine)
                    });
                    stack.push(yieldFn)
                } else {
                    throw new Error("tried to yield from outermost scope or without a block on frame?")
                }
            } else {
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
        case 'jump':
            let theLabel = value as string;
            log('jump to ' + theLabel);
            machine.jump(indexForLabel(code, theLabel));
            break;
        case 'jump_if': // jump if true...
            // dispatch('true', top as ReflexObject, stack, frames, machine, true);
            // ret(stack, frames, machine); //?
            // now top should be Truth
            let nowTop = stack[stack.length - 1];
            pop(stack);
            let shouldJump = (nowTop as ReflexObject).className === 'Truth';
            debug("jump if [true] -- top is " + nowTop + " / should jump? " + shouldJump);
            if (shouldJump) {
                let theLabel = value as string;
                log('jump to ' + theLabel);
                machine.jump(indexForLabel(code, theLabel));
            }
            break;
        case 'dispatch':
            let msg = value as string;
            let recv = top as ReflexObject;
            pop(stack);
            debug("dispatch " + msg + " to " + recv.inspect());
            log("STACK IS " + dump(stack));
            dispatch(value as string, top as ReflexObject, stack, frames, machine);
            log("AFTER DISPATCH " + msg + " to " + recv + " -- stack is " + dump(stack));
            break;
        default: assertNever(op);
    }
    return { stack, frames, machine: machine };
}
