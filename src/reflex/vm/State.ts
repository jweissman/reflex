import { Frame } from './Frame';
import { Stack } from './Stack';
import Machine from './Machine';
export interface State {
    stack: Stack;
    frames: Frame[];
    machine: Machine;
}
