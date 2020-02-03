import ReflexObject from './types/ReflexObject';
import { ReflexFunction } from './types/ReflexFunction';
import { Stack } from './Stack';
export interface Store { [key: string]: ReflexObject }
export interface Frame {
    stack: Stack;
    ip: number;
    self: ReflexObject;
    locals: Store;
    retValue?: ReflexObject;
    currentMethod?: ReflexFunction;
    block?: ReflexFunction;
    // fake: boolean;

    backingFrame?: Frame;
    opaque?: boolean;
}
