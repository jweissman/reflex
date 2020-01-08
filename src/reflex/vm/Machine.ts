import chalk from 'chalk';
import { Instruction, Code, indexForLabel, labelStep, prettyCode } from "./instruction/Instruction";
import { Value } from "./instruction/Value";
import ReflexObject from './types/ReflexObject';
import main, { bootLocals } from './Bootstrap';
import { ReflexFunction } from './types/ReflexFunction';
import { log } from './util/log';
import { Frame } from './Frame';
import { fail } from './util/fail';
import { invoke } from './instruction/invoke';
import { trace } from './instruction/trace';
import { update } from './update';
import Reflex from '../Reflex';
import { State } from './State';

export default class Machine {
    stack: Value[] = []
    frames: Frame[] = [{
        ip: 0, self: main(this),
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
            // log(`init execution @${label}, ip = ${this.ip}`)
            // log(prettyCode(code.slice(this.frame.ip+1,code.length-1)))
            this.executeLoop();
        } else {
            fail("Could not find label " + label)
        }
    }

    delaySecs: number = Reflex.config.delay
    executeLoop() {
        let halted = false;
        while (!halted) {
            let [op] = this.currentInstruction
            if (op === 'halt') {
                halted = true;
            } else {
                this.execute(this.currentInstruction)
                this.frame.ip++;
                this.syncDelay(this.delaySecs);
            }
        }
    }

    syncDelay(secs: number) {
        if (secs > 0) {
            var wait = new Date(new Date().getTime() + secs * 1000);
            while (wait > new Date()) {
                // spinlock
            }
        }
    }

    execute(instruction: Instruction) {
        let { stack, frames } = this.state
        // log('frames: ' + frames.flatMap(frame => frame.self.inspect()).join(","))
        let frame = frames[frames.length - 1]
        trace(`exec @${this.ip}`, instruction, frame, stack)
        update(this.state, instruction, this.currentProgram)
    }

    doInvoke(ret: ReflexObject | undefined, fn: ReflexFunction, ...args: ReflexObject[]) {
        args.forEach(arg => this.stack.push(arg))
        this.stack.push(fn)
        invoke(fn.arity, false, this.stack, this.frames, this.currentProgram, this, ret);
    }

    jump(newIp: number) {
        this.frame.ip = newIp;
        // throw new Error("Machine.jump -- Method not implemented.");
    }

    get state(): State { return { stack: this.stack, frames: this.frames, machine: this } }

    boundSelf: ReflexObject | null = null
    bindSelf(self: ReflexObject) { this.boundSelf = self; }
    unbindSelf() { this.boundSelf = null; }
}