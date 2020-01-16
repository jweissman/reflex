import { Frame } from '../Frame';
export function findFrameWithLocal(key: string, frames: Frame[]) {
    let top = frames[frames.length - 1];
    if (!top.locals[key] && frames.length > 1) {
        for (let i = frames.length - 1; i >= 0; i--) {
            let nextFrame = frames[i];
            if (nextFrame.locals[key]) {
                return nextFrame;
            } else if (nextFrame.backingFrame?.locals[key]) {
                return nextFrame.backingFrame
            }
        }
    }
    return top;
}
