import { Frame } from '../Frame';
import { debug } from '../util/log';

export function findFrameWithLocal(key: string, frames: Frame[]) {
    // debug("Find frame with local "  + key, frames);
    let top = frames[frames.length - 1];
    if (!top.locals[key] && frames.length > 1) {
       for (let i = frames.length - 1; i >= 0; i--) {
           let nextFrame = frames[i];
           if (!nextFrame.opaque && nextFrame.locals[key]) {
               return nextFrame;
           } else if (nextFrame.backingFrame?.locals[key]) {
               return nextFrame.backingFrame
           }
       }
    }
    return top;
}
