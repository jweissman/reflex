import ReflexObject from './types/ReflexObject';
export interface Frame {
    ip: number;
    self: ReflexObject;
    locals: { [key: string]: ReflexObject }
    retValue?: ReflexObject;
}
