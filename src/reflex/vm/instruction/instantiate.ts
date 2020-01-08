import { Code } from "./Instruction";
import ReflexObject from '../types/ReflexObject';
import { call } from './call';
import { invoke } from './invoke';
import { Stack } from '../Stack';
import { Frame } from '../Frame';
import Machine from '../Machine';
import { classRegistry } from '../types/ReflexClass';
export function instantiate(className: string, args: ReflexObject[], stack: Stack, frames: Frame[], code: Code, machine: Machine) {
    args.forEach(arg => { stack.push(arg); });
    // lookup class name, create & push???
    stack.push(classRegistry[className]);
    stack.push("new" as string);
    call(stack, frames);
    invoke(0, false, stack, frames, code, machine);
}
