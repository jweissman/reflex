import { Frame } from '../Frame';
import { Stack } from '../Stack';
export function ret(stack: Stack, frames: Frame[]) {
    let frame = frames[frames.length - 1];
    frames.pop();
    if (frame.retValue) {
        stack.push(frame.retValue);
    }
}
