import { Code, indexForLabel } from "./Instruction";
import ReflexObject from '../types/ReflexObject';
import { ReflexFunction, WrappedFunction } from '../types/ReflexFunction';
import { Frame } from '../Frame';
import { Stack } from '../Stack';
import { fail } from '../util/fail';
import { zip } from '../util/zip';
import { pop } from './pop';
import Machine from '../Machine';
import { log } from "../util/log";

export function invoke(
    arity: number,
    stack: Stack,
    frames: Frame[],
    code: Code,
    meta: Machine,
    ensureReturns?: ReflexObject
) {
    let top = stack[stack.length - 1];
    pop(stack);
    let args = [];
    for (let i = 0; i < arity; i++) {
        let newTop = stack[stack.length - 1];
        args.push(newTop);
        pop(stack);
    }
    if (top instanceof WrappedFunction) {
        let result = top.impl(meta, ...args);
        stack.push(result);
    }
    else if (top instanceof ReflexFunction) {
        log('invoke reflex fn with arity ' + top.arity)
        log('args ' + args)
        log('params ' + top.params)
        let oldFrame = frames[frames.length - 1];
        let self = oldFrame.self;
        if (top.frame.self) {
            self = top.frame.self.within(self);
        }
        let locals = {
            // ...oldFrame.locals,
            // ...top.frame.locals,
            ...Object.fromEntries(zip(top.params, args))
        };
        let newFrame: Frame = {
            // ...top.frame,
            ip: indexForLabel(code, top.label),
            locals,
            self,
            ...(ensureReturns ? { retValue: ensureReturns } : {}),
            // fake: false,
        };
        //  {
        //     ip: 
        //     self,
        //     locals,
        // };
        frames.push(top.frame);
        frames.push(newFrame);
    }
    else {
        log("invoke -- error, top not a function but " + top)
        fail("invoke -- expected top to be a function!");
    }
}