import { Code, indexForLabel, nextOperativeCommand } from "./Instruction";
import ReflexObject from '../types/ReflexObject';
import { ReflexFunction, WrappedFunction } from '../types/ReflexFunction';
import { Frame } from '../Frame';
import { Stack } from '../Stack';
import { zip } from '../util/zip';
import { pop } from './pop';
import Machine from '../Machine';
import { Value } from './Value';
import { makeReflexObject } from "../types/makeReflexObject";
import { ReflexNihil } from "../types/ReflexNihil";
import { getLocal } from "./getLocal";
import { RNumber, Indeterminate, PositiveApeiron, NegativeApeiron } from "../Bootstrap";
import { ReflexNumber, } from "../types/ReflexNumber";
import { log } from "../util/log";
import { dump } from "../util/dump";

function invokeReflex(top: ReflexFunction, args: Value[], stack: Stack, frames: Frame[], code: Code, machine: Machine, hasBlock: boolean, ensureReturns?: ReflexObject) {
    // log('INVOKE reflex fn ' + top.name + ' with arity ' + top.arity)
    // log('args ' + args)
    // log('params ' + top.params)
    // log('stack at invoke: ' + dump(stack))
    let frame = frames[frames.length - 1];
    let block;
    if (hasBlock) {
        block = stack[stack.length - 1] as ReflexFunction;
        pop(stack);
    }
    let self = frame.self;
    if (top.frame.self) {
        self = top.frame.self.within(self);
    }
    let locals = Object.fromEntries(zip(top.params, args));

    if (block && top.blockParamName) {
        locals[top.blockParamName] = block;
    }

    let ip = indexForLabel(code, top.label);
    let newFrame: Frame = {
        ip,
        locals,
        self,
        ...(ensureReturns ? { retValue: ensureReturns } : {}),
        currentMethod: top,
        ...(hasBlock ? { block } : {}),
    };

    let nihilate = false;
    if (top.frame.block) {
        newFrame.ip = top.frame.ip;
    }

    if (hasBlock) {
        let line = newFrame.ip;
        let next = nextOperativeCommand(code.slice(line));
        if (next) {
            let [nextOp] = next;
            let exhausted = nextOp === 'ret'
            if (exhausted) {
                nihilate = true;
            }
        } else {
            // no operative command upcoming, that seems like a problem?
            throw new Error("could not determine next upcoming command? (at least a halt should be present...?)")
        }
    }

    if (!nihilate) {
        frames.push(top.frame);
        frames.push(newFrame);
    } else {
        if (block) {
            let nil = makeReflexObject(machine, ReflexNihil.klass, []);
            invokeReflex(block, [nil], stack, frames, code, machine, false);
        } else {
            throw new Error("tried to pass nihil to a block, but there wasn't a block??")
        }
    }
}

export function castReflexToJavascript(object: ReflexObject): any {
    // let result = 
    if (object.className === 'Truth') { return true; }
    else if (object.className === 'Nihil') { return null; }
    else if (object.className === 'Falsity') { return false; }
    else if (object.className === 'Indeterminate') { return NaN; }
    else if (object.className === 'PositiveApeiron') { return Infinity; }
    else if (object.className === 'NegativeApeiron') { return -Infinity; }
    else if (object instanceof ReflexNumber) { return object.value; } // : object
    // else if (object.className === 'Nihil') { return null; }
        // dispatch('true', object, machine.stack, machine.frames, machine)
        // let top = stack[stack.length - 1];
        // if (top)
        // if (object.get(""))

    // } // : object
    // else if (object instanceof ReflexBoolean) { return object.value; } // : object
    return object
}
export function castJavascriptToReflex(machine: Machine, object: any): ReflexObject {
    if (object instanceof ReflexObject) {
        return object;
    } else if (typeof object === "number") {
        if (isNaN(object)) {
            log("WOULD CAST NaN to..." + Indeterminate)
            // throw new Error("Got NAN")
            return (
                makeReflexObject(machine, Indeterminate, []) //, [object as unknown as ReflexObject])
            )
        }
        if (object === Infinity) {
            return (
                makeReflexObject(machine, PositiveApeiron, []) //, [object as unknown as ReflexObject])
            )
        } else if (object === -Infinity) {
            return (
                makeReflexObject(machine, NegativeApeiron, []) //, [object as unknown as ReflexObject])
            )
        } else {
            return (
                makeReflexObject(machine, RNumber, [object as unknown as ReflexObject])
            )
        }
    } else if (object === true || object === false) {
        let varName = object ? 'true' : 'false'
        return (getLocal(varName, machine.activeFrames))
    } else {
        // if (object instanceof ReflexObject) {
            // return object;
        // } else {
            throw new Error("won't return uncast JS object")
        // }
    }
}

export function invoke(
    arity: number,
    hasBlock: boolean,
    stack: Stack,
    frames: Frame[],
    code: Code,
    machine: Machine,
    ensureReturns?: ReflexObject
) {
    let top = stack[stack.length - 1];
    log("INVOKE " + top + " (arity: " + arity + ") -- stack: " + dump(stack))
    // if (top instanceof WrappedFunction) { arity -= 1 } // hm
    pop(stack);

    let args = [];
    for (let i = 0; i < arity; i++) {
        let newTop = stack[stack.length - 1];
        // could try to convert for it??
        // if (newTop instanceof ReflexObject) {
        //     newTop = newTop; //castReflexToJavascript(newTop);
        // }
        args.push(newTop); //newTop instanceof ReflexNumber ? newTop.value : newTop);
        pop(stack);
    }
    if (top instanceof WrappedFunction) {
        if (hasBlock) {
            args.push(stack[stack.length - 1]); pop(stack);
        }
        if (top.boundSelf) {
            machine.bindSelf(top.boundSelf)
        }
        args = args.map(arg => arg instanceof ReflexObject ? castReflexToJavascript(arg) : arg); //
        let result = top.impl(machine, ...args);
        // log("GOT RESULT FROM WRAPPED FUNCTION: " + result)
        if (result !== undefined) {
            // stack.push(castJavascriptToReflex(machine, result))
            let toPush = castJavascriptToReflex(machine, result);
            // if (typeof result === "number") {
            //    toPush=(
            //        makeReflexObject(machine, RNumber, [result as unknown as ReflexObject])
            //    )
            // } else if (result === true || result === false) {
            //    let varName = result ? 'true' : 'false'
            //    toPush=(getLocal(varName, frames))
            // } else {
            //    toPush=(result);
            // }
            stack.push(toPush)
        }
        if (top.boundSelf) {
            machine.unbindSelf()
        }
    } else if (top instanceof ReflexFunction) {
        invokeReflex(top, args, stack, frames, code, machine, hasBlock, ensureReturns);
    }
    else {
        if (top instanceof ReflexObject) {
            let call = top.send('call');
            log("WOULD CALL " + call)
            args.reverse().forEach(arg => stack.push(arg))
            if (call instanceof WrappedFunction) { call.bind(top) }
            if (call instanceof ReflexFunction) { call.frame.self=top}
            stack.push(call);
            invoke(arity, hasBlock, stack, frames, code, machine, ensureReturns)
            // dispatch('call', top, args, stack, frames, code)
        }

        // fail("invoke -- expected top to be a function!");
    }
}