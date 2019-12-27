import chalk from 'chalk';
import assertNever from 'assert-never'
import { Value, Instruction, Code, prettyCode, prettyInstruct, Stone } from "./Instruction";
import ReflexObject from './types/ReflexObject';
import main from './Bootstrap';
import { ReflexFunction, WrappedFunction } from './types/ReflexFunction';
import Tree from '../lang/ast/Tree';
import { Defun } from '../lang/ast/Defun';
import { FunctionLiteral } from '../lang/ast/FunctionLiteral';
import { log } from './Log';

interface Frame {
    ip: number;
    self: ReflexObject;
}

type Stack = Value[]

function fail(err: string) {
    throw new Error("Machine failure: " + err)
}

function call(stack: Stack, frames: Frame[]) {
    let [second, top] = [
        stack[stack.length - 2],
        stack[stack.length - 1]
    ];
    log("CALL -- top: " + top + " second: " + (second) + "(" + typeof second + ")");
    if (second && second instanceof ReflexObject && top && typeof top === 'string') {
        stack.pop();
        stack.pop();
        let receiver = second;
        let method = top;
        let result = receiver.send(method);
        if (result instanceof ReflexFunction) {
            result.self = receiver;
        }
        stack.push(result)
    } else {
        dump(stack);
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

function invoke(arity: number, stack: Stack, frames: Frame[], code: Code) {
    let top = stack[stack.length - 1];
    stack.pop();
    if (top instanceof WrappedFunction) {
        let args = []
        // log("INVOKE wrapped function " + top.name + " with arity " + arity)
        for (let i = 0; i < arity; i++) {
            let newTop = stack[stack.length - 1]
            args.push(newTop);
            stack.pop();
        }
        let result = top.impl(...args)
        stack.push(result)
    } else if (top instanceof ReflexFunction) {
        let self = frames[frames.length - 1].self;
        if (top.self) {
            self = top.self.within(self);
        }
        let newFrame: Frame = {
            ip: indexForLabel(code, top.label),
            self,
        }
        frames.push(newFrame)
    } else {
        fail("invoke -- top wasn't reflex or wrapped fn!")
    }
}

function compile(ast: Tree, stack: Stack, meta: Machine) { 
    if (ast instanceof Defun || ast instanceof FunctionLiteral) {
        let label = `lambda-${lambdaCount++}`
        let name = label
        if (ast instanceof Defun) {
            name = ast.name.key
        }
        let code: Code = [
            ['label', label],
            ...ast.shell,
        ]
        meta.install(code)
        let fn = new ReflexFunction(name, label)
        stack.push(fn)
    } else {
        fail('compile only impl for defun/fun lit');
    }
}

const dump = (stack: Stack) => stack.map(it =>
    it ? ((it instanceof ReflexObject || it instanceof Tree) ? chalk.blue(it.inspect()) : chalk.blueBright(it.toString()))
        : 'null'
)

let lambdaCount = 0;
let lastSelf: ReflexObject = main;
let lastStack: Stack = [];
const trace = (message: string, instruction: Instruction, frame: Frame, stack: Stack) => {
    let self = frame.self;
    let msg = [
        ...(message ? [chalk.yellow(message)] : []),
        prettyInstruct(instruction),
        // ...(self !== lastSelf ? [
            chalk.gray("self: ") + frame.self.inspect(),
        // ] : []),
        ...(stack !== lastStack ? [chalk.gray("stack: ") + dump(stack)] : []),
    ].join("\n")
    lastSelf = self;
    lastStack = [...stack];
    log(msg);
}

interface State { stack: Stack, frames: Frame[], meta: Machine }
const update: (state: State, instruction: Instruction, code: Code) => State = (state, instruction, code) => {
    let [op, value] = instruction;
    let { meta, stack, frames } = state
    let frame = frames[frames.length - 1]
    switch (op) {
        case 'push': stack.push(value); break;
        case 'pop': stack.pop(); break;
        case 'mark': stack.push(new Stone(value as string)); break;
        case 'sweep': 
            while (stack.length > 0) {
                let top = stack[stack.length - 1]
                stack.pop();
                if (top instanceof Stone) {
                    if (top.name === value) {
                        break;
                    }
                }
            }
            break;
            // stack.push(new Stone(value as string)); break;
        case 'call': call(stack, frames); break;
        case 'ret': frames.pop(); break;
        case 'label': break;
        case 'halt': break;
        case 'invoke': invoke(value as number, stack, frames, code); break;
        case 'compile': compile(value as Tree, stack, meta); break;
        case 'send':
            let result = frame.self.send(value as string);
            stack.push(result);
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
        log("INSTALL CODE: " + prettyCode(code))
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
        // log("RUN CODE: " + prettyCode(code))
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
            log(chalk.yellow(`init execution @${label}, ip = ${this.ip}`))
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
        let { stack, frames } = this.state
        let frame = frames[frames.length - 1]
        trace(`exec @${this.ip}`, instruction, frame, stack)
        update(this.state, instruction, this.currentProgram)
    }

    get state() { return { stack: this.stack, frames: this.frames, meta: this } }
}