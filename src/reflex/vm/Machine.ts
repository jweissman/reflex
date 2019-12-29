import chalk from 'chalk';
import { Value, Instruction, Code, indexForLabel, labelStep, prettyCode } from "./Instruction";
import ReflexObject from './types/ReflexObject';
import main, { bootLocals } from './Bootstrap';
import { ReflexFunction } from './types/ReflexFunction';
import { log } from './util/log';
import { Frame } from './Frame';
import { fail } from './util/fail';
import { invoke } from './invoke';
import { trace } from './trace';
import { update } from './update';

export default class Machine {
    stack: Value[] = []
    frames: Frame[] = [{
        ip: 0, self: main,
        locals: bootLocals
    }];

    get top() { return this.stack[this.stack.length - 1] }
    get frame() { return this.frames[this.frames.length - 1] }
    get self() { return this.frame.self }
    get ip() { return this.frame.ip }

    currentProgram: Code = [];
    get currentInstruction() { return this.currentProgram[this.ip]; }

    sideload(newCode: Code) {
        this.currentProgram = [
            ...this.currentProgram,
            ['halt', null],
            ...newCode,
        ]
    }

    install(code: Code) {
        let stripped = 0;
        const stripMain = (code: Code) => code.flatMap(i => {
            let [op,value] = i
            if (op === 'label' && value === '.main') {
                stripped++
                return []
            }
            return [i];
        })
        let oldCode = stripMain(this.currentProgram)
        this.frame.ip-=stripped;
        this.currentProgram = [
            ...oldCode,
            ['label','.main'],
            ...code,
            ['halt', null]
        ]
    }

    run(code: Instruction[]) {
        this.install(code);
        this.initiateExecution('.main');
    }

    initiateExecution(label: string) {
        let code = this.currentProgram
        let step = labelStep(code, label)
        if (step) {
            let labelIndex = indexForLabel(code, label)
            this.frame.ip = labelIndex
            log(`init execution @${label}, ip = ${this.ip}`)
            log(prettyCode(code))
            this.executeLoop();
        } else {
            fail("Could not find label " + label)
        }
    }

    delaySecs: number = -1 //0.2
    executeLoop() {
        let halted = false;
        while (!halted) {
            let [op] = this.currentInstruction
            if (op === 'halt') {
                halted = true;
            } else {
                this.execute(this.currentInstruction)
                this.frame.ip++;
                if (this.delaySecs > 0) {
                    this.syncDelay(this.delaySecs)
                }
            }
        }
    }

    syncDelay(secs: number) {
            var waitTill = new Date(new Date().getTime() + secs * 1000);
            while (waitTill > new Date()) { }
    }

    execute(instruction: Instruction) {
        let { stack, frames } = this.state
        let frame = frames[frames.length - 1]
        trace(`exec @${this.ip}`, instruction, frame, stack)
        update(this.state, instruction, this.currentProgram)
    }

    doInvoke(ret: ReflexObject | undefined, fn: ReflexFunction, ...args: ReflexObject[]) {
        args.forEach(arg => this.stack.push(arg))
        this.stack.push(fn)
        invoke(fn.arity, this.stack, this.frames, this.currentProgram, this, ret);
    }

    get state() { return { stack: this.stack, frames: this.frames, meta: this } }
}