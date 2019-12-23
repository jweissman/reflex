import chalk from 'chalk';
import assertNever from 'assert-never'
import { Value, Instruction, Code } from "./Instruction";
import ReflexObject from './types/ReflexObject';
import main from './Bootstrap';
import { ReflexFunction, WrappedFunction } from './types/ReflexFunction';
import Reflex from '../Reflex';
import Tree from '../lang/ast/Tree';
import { Defun } from '../lang/ast/Defun';

interface Frame {
    ip: number;
    self: ReflexObject;
}

type Stack = Value[]

function log(message: string) {
    if (Reflex.trace) {
        console.log(chalk.green(message));
    }
}

function fail(err: string) {
    throw new Error("Machine failure: " + err)
}

function call(stack: Stack, frames: Frame[]) {
    let [second, top] = [
        stack[stack.length - 2],
        stack[stack.length - 1]
    ];
    if (second && second instanceof ReflexObject && top && typeof top === 'string') {
        stack.pop();
        stack.pop();
        let receiver = second;
        let method = top;
        let result = receiver.send(method);
        stack.push(result)
    } else {
        throw new Error("call expects top to be message, second to be recv")
    }
}

const labelStep = (code: Code, label: string) => code.find(([op, val]) => op === 'label' && val === label)
const indexForLabel = (code: Code, label: string) => {
    let step = labelStep(code, label) 
    if (step) {
        return code.indexOf(step)
    } else {
        throw new Error("no such label found: " + label)
    }
}

function invoke(stack: Stack, frames: Frame[], code: Code) {
    let top= stack[stack.length - 1];
    if (top instanceof WrappedFunction) {
        stack.pop();
        let arity = top.impl.length
        let args = []
        log(`INVOKE ${top.name} -- ${arity} -- ${stack.length}`)
        for (let i = 0; i < arity; i++) {
            let newTop = stack[stack.length - 1]
            args.push(newTop);
            stack.pop();
        }
        let result = top.impl(...args)
        stack.push(result)
    } else if (top instanceof ReflexFunction) {
        // fail("invoke -- not impl for reflex fn")
        let newFrame: Frame = {
            ip: indexForLabel(code, top.label),
            self: frames[frames.length - 1].self,
        }
        frames.push(newFrame)
    } else {
        fail("invoke -- top wasn't reflex fn!")
    }
}

function compile(ast: Tree, stack: Stack, meta: Machine) { 
    if (ast instanceof Tree) {
        if (ast instanceof Defun) {
            let label = `lambda-${lambdaCount++}`
            let code: Code = [
                ['label', label],
                ...ast.shell
            ]
            console.log("AT COMPILE", { code })
            meta.install(code)
            let name = ast.name.key
            let fn = (new ReflexFunction(name, label))
            stack.push(fn)
        } else {
            fail('compile not reall impl for trees');
        }
    } else {
        fail('compile only impl for trees');
    }
}

// const dump = (stack: Stack) => stack.map(it => 
//     it ? ((it instanceof ReflexObject || it instanceof Tree) ? it.inspect() : it)
//        : 'null'
// )

let lambdaCount = 0;
interface State { stack: Stack, frames: Frame[], meta: Machine }
const update: (state: State, instruction: Instruction, code: Code) => State = (state, instruction, code) => {
    let [op, value] = instruction;
    let { meta, stack, frames } = state
    let frame = frames[frames.length - 1]
    // let {self} = frame
    // log(op + " -- " + value);
    switch (op) {
        case 'push': stack.push(value); break;
        case 'pop': stack.pop(); break;
        case 'load': fail('load not impl'); break;
        case 'store': fail('store not impl'); break;
        case 'call': call(stack, frames); break;
        case 'ret': frames.pop(); break;
        case 'jump': fail('jump not impl'); break;
        case 'label': log(`@ label: ${value}`); break;
        case 'halt': break;
        case 'invoke': invoke(stack, frames, code); break;
        case 'compile': compile(value as Tree, stack, meta); break;
        case 'send':
            let result = frame.self.send(value as string);
            stack.push(result)
            break;
        case 'send_eq':
            // log('stack: ' + dump(stack))
            let key = value as string;
            let top = stack[stack.length - 1];
            if (top instanceof ReflexObject) {
                log(`SEND EQ ${key}=${top.inspect()}`)
                frame.self.set(key, top);
            } else {
                fail("send_eq expects top is be reflex obj to assign")
            }
            break;
        default: assertNever(op);
    }
    return { stack, frames, meta };
}

export default class Machine {
    // ip: number = 0;
    stack: Value[] = []
    frames: Frame[] = [{ ip: 0, self: main }];

    get top() { return this.stack[this.stack.length - 1] }
    get frame() { return this.frames[this.frames.length - 1] }
    get self() { return this.frame.self }
    get ip() { return this.frame.ip }

    currentProgram: Code = [];
    get currentInstruction() { return this.currentProgram[this.ip]; }

    install(code: Code) {
        log("INSTALL CODE")
        const stripMain = (code: Code) => code.flatMap(i => {
            let [op,value] = i
            if (op === 'label' && value === '.main') {
                return []
            }
            return [i];
        })
        this.frame.ip--;
        this.currentProgram = [ ...stripMain(this.currentProgram), ['label','.main'], ...code, ['halt', null] ]
    }

    run(code: Instruction[]) {
        // log("RUN CODE")
        this.install(code);
        this.initiateExecution('.main');
    }

    initiateExecution(label: string) {
        let code = this.currentProgram
        let step = labelStep(code, label)
        if (step) {
            let labelIndex = indexForLabel(code, label)
            // if (labelIndex !== -1) {
            this.frame.ip = labelIndex
            log(`init execution @${label}, ip = ${this.ip}`)
            this.executeLoop();
            // }
        } else {
            fail("Could not find label " + label)
        }
    }

    executeLoop() {
        // log(`HARD LOOP -- ip=${this.ip}`)
        let halted = false;
        while (!halted) {
            let [op] = this.currentInstruction
            if (op === 'halt') {
                halted = true;
            } else {
                this.execute(this.currentInstruction)
                this.frame.ip++;
            }
        }
    }

    execute(instruction: Instruction) {
        // let [op,value] = instruction;
        // log("EXEC " + op + " -- " + value);
        update(this.state, instruction, this.currentProgram)
    }

    get state() { return { stack: this.stack, frames: this.frames, meta: this }}
}