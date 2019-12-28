import chalk from 'chalk';
import assertNever from 'assert-never'
import { Value, Instruction, Code, prettyCode, prettyInstruct, Stone } from "./Instruction";
import ReflexObject from './types/ReflexObject';
import main from './Bootstrap';
import { ReflexFunction, WrappedFunction } from './types/ReflexFunction';
import Tree from '../lang/ast/Tree';
import { Defun } from '../lang/ast/Defun';
import { FunctionLiteral } from '../lang/ast/FunctionLiteral';
import { log } from './log';
import { Frame } from './Frame';
import { Stack } from './Stack';
import { fail } from './fail';
import ReflexClass from './types/ReflexClass';
import { Bareword } from '../lang/ast/Bareword';

function zip(a: any[], b: any[]) {
    return a.map((value, index) => [value, b[index]])
}

function pop(stack: Stack) {
    if (stack.length > 0) {
        stack.pop()
    } else {
        throw new Error("Stack was empty, could not pop!")
    }
}

function call(stack: Stack, frames: Frame[]) {
    let [second, top] = [
        stack[stack.length - 2],
        stack[stack.length - 1]
    ];
    let frame = frames[frames.length - 1]
    log("CALL -- top: " + top + " second: " + (second) + "(" + typeof second + ")");
    if (second && second instanceof ReflexObject && top && typeof top === 'string') {
        pop(stack);
        pop(stack);
        let receiver = second;
        let method = top;
        let result; 
        // locals shadow
        if (frame.locals[method]) {
            let local = frame.locals[method]
            result = local;
            if (result instanceof ReflexFunction) {
                // result.self = frame.self; // SHOULD we even override self here???
                                          // (what does that even really mean semantically?)
                                          // seems like if you have a local copy of bound fn,
                                          // we would NOT want this behavior
            }
        } else {
            result = receiver.send(method);
            if (result instanceof ReflexFunction) {
                result.self = receiver;
            }
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

function invoke(arity: number, stack: Stack, frames: Frame[], code: Code, meta: Machine, ensureReturns?: ReflexObject) {
    let top = stack[stack.length - 1];
    pop(stack);
    // stack.pop();
    let args = []
    // log("INVOKE wrapped function " + top.name + " with arity " + arity)
    for (let i = 0; i < arity; i++) {
        let newTop = stack[stack.length - 1]
        args.push(newTop);
        pop(stack);
        // stack.pop();
    }
    if (top instanceof WrappedFunction) {
        let result = top.impl(meta, ...args)
        stack.push(result)
    } else if (top instanceof ReflexFunction) {
        let oldFrame = frames[frames.length - 1]
        let self = oldFrame.self;
        if (top.self) {
            self = top.self.within(self);
        }
        log("INVOKE reflex fn " + top.name + " with arity " + arity + " -- params = " + top.params + " / args = " + args);
        let locals = { ...oldFrame.locals, ...Object.fromEntries(zip(top.params, args)) }
        // top.
        let newFrame: Frame = {
            ip: indexForLabel(code, top.label),
            self,
            locals,
            ...(ensureReturns ? { retValue: ensureReturns } : {}),
        }
        log("INVOKE push frame with locals: " + Object.keys(locals))
        frames.push(newFrame)
    } else {
        console.log("TOP: " + top + "(" + typeof top + ")");
        fail("invoke -- top wasn't reflex or wrapped fn!")
    }
}

function compile(ast: Tree, stack: Stack, meta: Machine) { 
    if (ast instanceof Defun || ast instanceof FunctionLiteral) {
        let label = `lambda-${lambdaCount++}`
        let name = label
        let arity = ast.params.length
        if (ast instanceof Defun) {
            name = ast.name.key
        }
        let code: Code = [
            ['label', label],
            ...ast.shell,
        ]
        meta.install(code)
        let fn = ReflexClass.makeInstance(meta, ReflexFunction.klass, []) as ReflexFunction; //, [name, label])
        fn.name = name;
        fn.label = label;
        fn.arity = arity;
        fn.params = ast.params.map(param => (param as Bareword).word)
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
        case 'pop': pop(stack); break;
        case 'mark': stack.push(new Stone(value as string)); break;
        case 'sweep': 
            while (stack.length > 0) {
                let top = stack[stack.length - 1]
                pop(stack);
                // stack.pop();
                if (top instanceof Stone) {
                    if (top.name === value) {
                        break;
                    }
                }
            }
            break;
            // stack.push(new Stone(value as string)); break;
        case 'call': call(stack, frames); break;
        case 'ret':
            frame = frames[frames.length - 1];
            frames.pop();
            if (frame.retValue) {
                stack.push(frame.retValue);
            }
            break;
        case 'label': break;
        case 'halt': break;
        case 'invoke': invoke(value as number, stack, frames, code, meta); break;
        case 'compile': compile(value as Tree, stack, meta); break;
        case 'local_var_set':
            // log('stack: ' + dump(stack))
            let key = value as string;
            let top = stack[stack.length - 1];
            if (top instanceof ReflexObject) {
                // stack.pop()
                log(`LOCAL VAR SET ${key}=${top.inspect()}`)
                frame.locals[key] = top;

                // frame.self.set(key, top);
                // stack.push(key)
            } else {
                fail("local_var_set expects top is be reflex obj to assign")
            }
            break;
        case 'send':
            let val: string = value as string;
            if (Object.keys(frame.locals).includes(val)) {
                stack.push(frame.locals[val])
            } else {
                let result = frame.self.send(val);
                stack.push(result);
            }
            break;
        case 'send_eq':
            log('send eq -- stack: ' + dump(stack))
            let k = value as string;
            let recv = stack[stack.length - 1];
            pop(stack)
            let obj = stack[stack.length - 1];
            if (obj instanceof ReflexObject && recv instanceof ReflexObject) {
                // stack.pop()
                log(`SEND EQ ${recv.inspect()}.${k}=${obj.inspect()}`)
                // frame.locals[key] = top;
                // frame.self.
                recv.set(k, obj);
                // stack.push(key)
            } else {
                fail("send_eq expects top is be reflex obj to receiver, second to be object to assign")
            }
            break;
        default: assertNever(op);
    }
    return { stack, frames, meta };
}

export default class Machine {
    // ip: number = 0;
    stack: Value[] = []
    frames: Frame[] = [{ ip: 0, self: main, locals: {} }];

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
        this.install(code);
        this.initiateExecution('.main');
    }

    initiateExecution(label: string) {
        let code = this.currentProgram
        let step = labelStep(code, label)
        if (step) {
            let labelIndex = indexForLabel(code, label)
            this.frame.ip = labelIndex
            log(chalk.yellow(`init execution @${label}, ip = ${this.ip}`))
            this.executeLoop();
        } else {
            fail("Could not find label " + label)
        }
    }

    executeLoop() {
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

    doInvoke(ret: ReflexObject | undefined, fn: ReflexFunction, ...args: ReflexObject[]) {
        args.forEach(arg => this.stack.push(arg))
        this.stack.push(fn)
        invoke(fn.arity, this.stack, this.frames, this.currentProgram, this, ret);
    }

    get state() { return { stack: this.stack, frames: this.frames, meta: this } }
}