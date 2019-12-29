import ReflexObject from './types/ReflexObject';
export interface Store { [key: string]: ReflexObject }
export interface Frame {
    ip: number;
    self: ReflexObject;
    locals: Store;
    retValue?: ReflexObject;
}
