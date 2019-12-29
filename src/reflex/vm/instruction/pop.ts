import { Stack } from '../Stack';
export function pop(stack: Stack) {
    if (stack.length > 0) {
        stack.pop();
    }
    else {
        throw new Error("Stack was empty, could not pop!");
    }
}
