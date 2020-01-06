import { Code, indexForLabel, prettyCode, nextOperativeCommand } from "./Instruction";
import ReflexObject from '../types/ReflexObject';
import { ReflexFunction, WrappedFunction } from '../types/ReflexFunction';
import { Frame } from '../Frame';
import { Stack } from '../Stack';
import { fail } from '../util/fail';
import { zip } from '../util/zip';
import { pop } from './pop';
import Machine from '../Machine';
import { log } from "../util/log";
import { Value } from './Value';
import ReflexClass, { classRegistry } from "../types/ReflexClass";
import { ReflexNihil } from "../types/ReflexNihil";
import { dump } from "../util/dump";
import { call } from "./call";
import { instantiate } from "../update";

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
        // log('block ' + block.inspect())
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

    // let topFrameBlock = !!top.frame.block;
    let nihilate = false; //!!top.frame.block;
    if (top.frame.block) {
        newFrame.ip = top.frame.ip;
        // if the instruction at this ip is ret...
        // we can invoke the block with nihil
    }

    if (hasBlock) {
        let line = newFrame.ip;
        let next = nextOperativeCommand(code.slice(line));
        // log("!!! next operative command: " + next);
        if (next) {
            let [nextOp] = next;
            let exhausted = nextOp === 'ret'
            // log("got a block, checking if it's exhausted (instruction is at ret): " + exhausted + " / " + nextOp);
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
        // let block = top.frame.block;
        if (block) {
            // log("NIHILATE")
            let nil = ReflexClass.makeInstance(machine, ReflexNihil.klass, []);
            // stack.push(nil);
            // stack.push(block);
            invokeReflex(block, [nil], stack, frames, code, machine, false);
        } else {
            throw new Error("tried to pass nihil to a block, but there wasn't a block??")
        }
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
    // log("INVOKE "+arity + "-- stack " + dump(stack))
    let top = stack[stack.length - 1];
    pop(stack);
    let args = [];
    for (let i = 0; i < arity; i++) {
        let newTop = stack[stack.length - 1];
        args.push(newTop);
        pop(stack);
    }
    if (top instanceof WrappedFunction) {
        log("CALL WRAPPED FN " + top.name)
        if (hasBlock) {
            // pass block as arg
            args.push(stack[stack.length - 1]); pop(stack);
        }
        // machine.self = top.frame.self
        // frames.push({
        //     ip: -1,
        //     self: machine.self,
        //     // self: stack[stack.length-1] as ReflexObject,
        //     locals: {}
        // })
        // debugger;
        // what is the receiver?? what should it be???
        // it's got to be a bound self at get time really...
        if (top.boundSelf) {
            // let newFrame = { ...frames[stack.length - 1] }
            // newFrame.self = top.boundSelf
            // frames.push(newFrame)
            machine.bindSelf(top.boundSelf)
        }
        let result = top.impl(machine, ...args);
        log("CALL WRAPPED FN " + top.name + " === RESULT " + result)
        if (result !== undefined) {
            if (result === true || result === false) {
                let className = result ? 'Truth' : 'Falsity'
                log("WOULD PUSH BOOL: "+ result + " / " + className)
                instantiate(className, stack, frames, code, machine)
                // stack.push(classRegistry[className])
                // stack.push("new" as string)
                // call(stack, frames);
            } else {
                stack.push(result);
            }
        }
        if (top.boundSelf) {
            machine.unbindSelf()
        //     frames.pop()
        }
            // machine.ungraft() //top.boundSelf)
        // frames.pop()
    } else if (top instanceof ReflexFunction) {
        invokeReflex(top, args, stack, frames, code, machine, hasBlock, ensureReturns);
    }
    else {
        // warn("invoke -- error, top not a function but " + top)
        fail("invoke -- expected top to be a function!");
    }
}