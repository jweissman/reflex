import { Frame } from '../Frame';
import { findFrameWithLocal } from "./findFrameWithLocal";
export function hasLocal(key: string, frames: Frame[]) {
    let v: string = key as string;
    let localFrame = findFrameWithLocal(v, frames);
    if (Object.keys(localFrame.locals).includes(v)) {
        return true;
        // stack.push(localFrame.locals[v]);
    }
    return false;
}
