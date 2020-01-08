import { Frame } from '../Frame';
import { findFrameWithLocal } from "./findFrameWithLocal";
export function getLocal(key: string, frames: Frame[]) {
    let v: string = key as string;
    let localFrame = findFrameWithLocal(v, frames);
    if (Object.keys(localFrame.locals).includes(v)) {
        return localFrame.locals[v];
    }
    else {
        throw new Error('Unknown local variable ' + v);
    }
}
