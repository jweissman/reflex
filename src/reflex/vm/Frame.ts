import ReflexObject from './types/ReflexObject';
import { ReflexFunction } from './types/ReflexFunction';
export interface Store { [key: string]: ReflexObject }
export interface Frame {
    ip: number;
    self: ReflexObject;
    locals: Store;
    retValue?: ReflexObject;
    currentMethod?: ReflexFunction;
    block?: ReflexFunction;
    // fake: boolean;
}
