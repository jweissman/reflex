import { Value } from "./Value";
import { Stone } from "./Stone";
import { Stack } from '../Stack';
import { pop } from './pop';
export function sweep(value: Value, stack: Stack) {
    while (stack.length > 0) {
        let top = stack[stack.length - 1];
        pop(stack);
        if (top instanceof Stone) {
            if (top.name === value) {
                break;
            }
        }
    }
}
