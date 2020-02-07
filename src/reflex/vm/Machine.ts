import { Instruction, Code, indexForLabel, labelStep, prettyCode } from "./instruction/Instruction";
import ReflexObject from './types/ReflexObject';
import main, { bootLocals } from './Bootstrap';
import { ReflexFunction } from './types/ReflexFunction';
import { Frame } from './Frame';
import { fail } from './util/fail';
import { trace } from './instruction/trace';
import Reflex from '../Reflex';
import { State } from './State';
import { debug } from "./util/log";
import Controller from "./Controller";
import { Loader } from "./Loader";


class Pseudofunction extends ReflexFunction {
    constructor(public name: string) { super(); }
}

export default class Machine {
    controller: Controller = new Controller(this);
    loader: Loader = new Loader();
    private frames: Frame[] = [{
        ip: 0, self: main(this),
        locals: bootLocals,
        stack: [],
        currentMethod: new Pseudofunction('(main)'),
    }];
    private currentProgram: Code = [];
    tracedOutput: string[] = [];

    constructor(private reflex: Reflex) {}

    get frame() { return this.frames[this.frames.length - 1] }
    get stack() { return this.frame.stack }
    get self() { return this.frame.self }
    get ip() { return this.frame.ip }
    get top() { return this.stack[this.stack.length - 1] }

    get currentInstruction() { return this.currentProgram[this.ip]; }

    get activeStack() { return this.stack }
    get activeFrames() { return this.frames }
    get activeProgram() { return this.currentProgram }

    reset() { this.frame.stack = [] }

    import(given: string) {
        this.reflex.evaluate(
            this.loader.getContents(given)
        )
        this.stack.push(this.controller.localVarGet('true'))
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
            debug(prettyCode(code.slice(this.frame.ip+1,code.length-1)), this.frames)
            this.executeLoop(()=>false);
        } else {
            fail("Could not find label " + label)
        }
    }

    halt() { this.halted = true; }
    halted = false;
    // delaySecs: number = Reflex.config.delay
    executeLoop(haltPredicate: Function) {
        this.halted = false;
        while (!this.halted && !haltPredicate(this.currentInstruction)) {
            this.execute(this.currentInstruction)
            this.frame.ip++;
        }
    }
    
    execute(instruction: Instruction) {
        trace(`exec @${this.ip}`, instruction, this.state.frames)
        this.controller.execute(instruction)
    }

    doInvoke(ret: ReflexObject | undefined, fn: ReflexFunction, ...args: ReflexObject[]) {
        // args.forEach(arg => this.stack.push(arg))
        this.stack.push(args)
        this.stack.push(fn)
        debug("DO INVOKE " + fn + " WITH ARGS " + args, this.frames)
        this.controller.invoke(fn.arity, false, ret);
    }

    jump(newIp: number) {
        this.frame.ip = newIp;
    }

    throw(err: string) {
        throw new Error(err) //"Machine#throw -- Method not implemented.");
    }

    get state(): State { return { stack: this.stack, frames: this.frames, machine: this } }

    boundSelf: ReflexObject | null = null
    bindSelf(self: ReflexObject) { this.boundSelf = self; }
    unbindSelf() { this.boundSelf = null; }
}