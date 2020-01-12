import { Instruction, Code, indexForLabel, labelStep, prettyCode } from "./instruction/Instruction";
import { Value } from "./instruction/Value";
import ReflexObject from './types/ReflexObject';
import main, { bootLocals } from './Bootstrap';
import { ReflexFunction } from './types/ReflexFunction';
import { Frame } from './Frame';
import { fail } from './util/fail';
import { invoke } from './instruction/invoke';
import { trace } from './instruction/trace';
import { update } from './update';
import Reflex from '../Reflex';
import { State } from './State';
import fs from 'fs';
import { debug } from "./util/log";
import Controller from "./Controller";

export default class Machine {
    controller: Controller = new Controller(this);
    private stack: Value[] = []
    private frames: Frame[] = [{
        ip: 0, self: main(this),
        locals: bootLocals
    }];
    private currentProgram: Code = [];

    constructor(private reflex: Reflex) {}

    get top() { return this.stack[this.stack.length - 1] }
    get frame() { return this.frames[this.frames.length - 1] }
    get self() { return this.frame.self }
    get ip() { return this.frame.ip }

    get currentInstruction() { return this.currentProgram[this.ip]; }

    get activeStack() { return this.stack }
    get activeFrames() { return this.frames }
    get activeProgram() { return this.currentProgram }

    reset() { this.stack = [] }

    import(given: string) {
        // add literally to code @ instruction pointer???
        // as though this line was that code??
        if (!given.endsWith(".reflex")) { given += ".reflex"; }
        let paths = [
            __dirname + "\\..\\lib\\" + given,
            // given,
            process.cwd() + "\\" + given,
        ];
        let path = paths.find(p => fs.existsSync(p))
        if (path) {
            let contents: string = fs.readFileSync(path).toString();
            // console.log("READ CONTENTS", { given, contents })
            this.reflex.evaluate(contents.toString())
        } else {
            throw new Error("Could find find path " + given)
        }
    }

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
            ['halt', null],
            // ['halt', null]
        ]
    }


    run(code: Instruction[]) {
        // if (code.length) {
            this.install(code);
            this.initiateExecution('.main');
        // }
    }


    initiateExecution(label: string) {
        let code = this.currentProgram
        let step = labelStep(code, label)
        if (step) {
            let labelIndex = indexForLabel(code, label)
            this.frame.ip = labelIndex
            // log(`init execution @${label}, ip = ${this.ip}`)
            debug(prettyCode(code.slice(this.frame.ip+1,code.length-1)))
            this.executeLoop();
        } else {
            fail("Could not find label " + label)
        }
    }

    halt() { this.halted = true; }
    halted = false;
    delaySecs: number = Reflex.config.delay
    executeLoop() {
        this.halted = false;
        while (!this.halted) { //} && this.currentInstruction) {
            // console.log("CURRENT INSTRUCTION: " + this.currentInstruction)
            let [op] = this.currentInstruction
            
            // {
            this.execute(this.currentInstruction)
            this.frame.ip++;
            this.syncDelay(this.delaySecs);
            // }
            if (op === 'halt') {
                this.halted = true;
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
        let frame = frames[frames.length - 1]
        trace(`exec @${this.ip}`, instruction, frame, stack)
        this.controller.execute(instruction)
        // update(this.state, instruction, this.currentProgram)
    }

    doInvoke(ret: ReflexObject | undefined, fn: ReflexFunction, ...args: ReflexObject[]) {
        args.forEach(arg => this.stack.push(arg))
        this.stack.push(fn)
        invoke(fn.arity, false, this.stack, this.frames, this.currentProgram, this, ret);
    }

    jump(newIp: number) {
        this.frame.ip = newIp;
    }

    get state(): State { return { stack: this.stack, frames: this.frames, machine: this } }

    boundSelf: ReflexObject | null = null
    bindSelf(self: ReflexObject) { this.boundSelf = self; }
    unbindSelf() { this.boundSelf = null; }
}