import { Stone } from "./Stone";
import { Stack } from '../Stack';
export function mark(stack: Stack, value: string) {
    stack.push(new Stone(value));
}
