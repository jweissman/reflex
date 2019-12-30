import util from 'util'
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
import { dump } from '../util/dump';

export function invoke(
    arity: number,
    hasBlock: boolean,
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
        log('INVOKE reflex fn ' + top.name + ' with arity ' + top.arity)
        log('args ' + args)
        log('params ' + top.params)
        let frame = frames[frames.length - 1];
        let block;
        if (hasBlock) {
            log("HAS BLOCK")
            // throw new Error("has block: " + util.inspect(hasBlock))
            block = stack[stack.length - 1] as ReflexFunction;
            pop(stack);
            log('block ' + block.inspect())
        }
        let self = frame.self;
        if (top.frame.self) {
            self = top.frame.self.within(self);
        }
        let locals = Object.fromEntries(zip(top.params, args));

        let ip = indexForLabel(code, top.label);
        debugger;

        let newFrame: Frame = {
            // ...top.frame,
            // ip: top.frame?.ip ||
            ip,
            locals,
            self,
            ...(ensureReturns ? { retValue: ensureReturns } : {}),
            currentMethod: top,
            ...(hasBlock ? { block } : {}),
        };

        debugger;
        if (top.frame.block) {
            debugger;
            newFrame.ip = top.frame.ip;
        }

        frames.push(top.frame);
        frames.push(newFrame);
    }
    else {
        log("invoke -- error, top not a function but " + top)
        fail("invoke -- expected top to be a function!");
    }
}