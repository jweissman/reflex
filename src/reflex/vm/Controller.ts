import { Value } from './instruction/Value';
import Machine from './Machine';
import { Instruction, indexForLabel, Code, nextOperativeCommand } from './instruction/Instruction';
import { Stone } from './instruction/Stone';
import { log, debug } from './util/log';
import ReflexObject from './types/ReflexObject';
import { ReflexFunction, WrappedFunction } from './types/ReflexFunction';
import { dump } from './util/dump';
import { ReflexNihil } from './types/ReflexNihil';
import ReflexClass from './types/ReflexClass';
import Tree from '../lang/ast/Tree';
import { hasLocal } from './instruction/hasLocal';
import { getLocal } from './instruction/getLocal';
import { Frame } from './Frame';
import { findFrameWithLocal } from './instruction/findFrameWithLocal';
import assertNever from 'assert-never';
import { Defun } from '../lang/ast/Defun';
import { FunctionLiteral } from '../lang/ast/FunctionLiteral';
import { Parameter } from '../lang/ast/Parameter';
import { zip } from './util/zip';
import { makeReflexObject } from './types/makeReflexObject';
import { Converter } from './Converter';

export class Controller {
    private converter: Converter = new Converter(this);

    get stack() { return this.machine.activeStack; }
    get frames() { return this.machine.activeFrames; }
    get code() { return this.machine.activeProgram; }

    constructor(private machine: Machine) { }

    public makeObject(klass: ReflexClass, args: any[]) { return makeReflexObject(this.machine, klass, args) }
    public makeNil(): ReflexNihil { return this.makeObject(ReflexNihil.klass, []) as ReflexNihil; }
    public makeFunction(): ReflexFunction { return this.makeObject(ReflexFunction.klass, []) as ReflexFunction; }

    execute(instruction: Instruction) {
        let [op, value] = instruction;
        let { frame, top } = this.machine
        switch (op) {
            case 'label': break;
            case 'halt': break;
            case 'push': this.push(value); break;
            case 'pop': this.pop(); break;
            case 'mark': this.mark(value as string); break;
            case 'sweep': this.sweep(value); break;
            case 'call': this.call(); break;
            case 'ret': this.ret(); break;
            case 'compile': this.compile(value as Tree); break;
            case 'invoke_block': this.invoke(value as number, true); break;
            case 'invoke': this.invoke(value as number, false); break;
            case 'send_eq':
                this.sendEq(value as string);
                break;
            case 'local_var_get':
                if (hasLocal(value as string, this.frames)) {
                    this.push(getLocal(value as string, this.frames))
                } else {
                    throw new Error("no such local variable '" + value as string + "'")
                }
                break;
            case 'local_var_set':
                let key = value as string;
                this.pop()
                if (top instanceof ReflexObject) {
                    let localFrame: Frame = findFrameWithLocal(key, this.frames);
                    localFrame.locals[key] = top;
                } else {
                    fail("local_var_set expects top is be reflex obj to assign");
                }
                break;
            case 'local_var_or_eq':
                let k = value as string;
                let t = this.stack[this.stack.length - 1];
                this.pop()
                if (t instanceof ReflexObject) {
                    let localFrame: Frame = findFrameWithLocal(k, this.frames);
                    if (localFrame === frame &&
                        !frame.locals[k]) {
                        frame.locals[k] = t;
                    }
                } else {
                    fail("local_var_set expects top is reflex obj to assign");
                }
                break;
            case 'bare':
                let v: string = value as string;
                if (hasLocal(v, this.frames)) {
                    this.push(getLocal(v, this.frames));
                } else if (v === 'yield') {
                    if (frame.currentMethod && frame.block) {
                        let yieldFn = new WrappedFunction('yielder', (...args: ReflexObject[]) => {
                            frame.currentMethod!.frame = { ...frame };
                            this.ret();
                            let fn = frame.block as ReflexFunction;
                            args.forEach(arg => this.push(arg))
                            this.push(fn);
                            this.invoke(fn.arity, !!fn.blockParamName)
                        });
                        this.push(yieldFn)
                    } else {
                        throw new Error("tried to yield from outermost scope or without a block on frame?")
                    }
                } else {
                    this.push(frame.self)
                    this.push(value as string)
                    this.call()
                }
                break;
            case 'send':
                let val: string = value as string;
                let result = frame.self.send(val);
                this.push(result);
                break;
            case 'send_or_eq':
                let theKey = value as string;
                if (!frame.self.respondsTo(theKey)) {
                    this.sendEq(value as string);
                }
                break;
            case 'jump':
                let theLabel = value as string;
                this.machine.jump(indexForLabel(this.code, theLabel));
                break;
            case 'jump_if':
                let nowTop = this.stack[this.stack.length - 1];
                this.pop();
                let shouldJump = (nowTop as ReflexObject).className === 'Truth';
                if (shouldJump) {
                    let theLabel = value as string;
                    this.machine.jump(indexForLabel(this.code, theLabel));
                }
                break;
            case 'dispatch':
                this.pop();
                this.dispatch(value as string, top as ReflexObject);
                break;
            default: assertNever(op);
        }
        return;
    }

    invoke(
        arity: number,
        hasBlock: boolean,
        ensureReturns?: ReflexObject
    ) {
        let top = this.stack[this.stack.length - 1];
        log("INVOKE " + top + " (arity: " + arity + ") -- stack: " + dump(this.stack))
        this.pop()
        let args = [];
        for (let i = 0; i < arity; i++) {
            let newTop = this.stack[this.stack.length - 1];
            args.push(newTop);
            this.pop();
        }
        if (top instanceof WrappedFunction) {
            if (hasBlock) {
                args.push(this.stack[this.stack.length - 1]);
                this.pop();
            }
            if (top.boundSelf) {
                this.machine.bindSelf(top.boundSelf)
            }
            args = args.map(arg =>
                arg instanceof ReflexObject
                    ? Converter.castReflexToJavascript(arg)
                    : arg
            );
            let result = top.impl(this.machine, ...args);
            if (result !== undefined) {
                let toPush = this.converter.castJavascriptToReflex(result);
                this.push(toPush)
            }
            if (top.boundSelf) {
                this.machine.unbindSelf()
            }
        } else if (top instanceof ReflexFunction) {
            this.invokeReflex(top, args, hasBlock, ensureReturns);
        }
        else {
            if (top instanceof ReflexObject) {
                let call = top.send('call');
                log("WOULD CALL " + call)
                args.reverse().forEach(arg => this.push(arg))
                if (call instanceof WrappedFunction) { call.bind(top) }
                if (call instanceof ReflexFunction) { call.frame.self = top }
                this.push(call);
                this.invoke(arity, hasBlock, ensureReturns)
            }
        }
    }


    protected push(object: Value) {
        if (object === undefined) {
            throw new Error("Won't push undefined onto stack");
        }
        else if (object === null) {
            throw new Error("Won't push raw null onto stack");
        }
        else {
            this.machine.activeStack.push(object);
        }
    }

    protected pop() {
        if (this.stackIsEmpty()) {
            throw new Error("Stack was empty, could not pop!");
        } else {
            this.stack.pop();
        }
    }

    protected mark(value: string) {
        this.push(new Stone(value));
    }

    protected sweep(value: Value) {
        while (!this.stackIsEmpty) {
            let top = this.stack[this.stack.length - 1];
            this.pop();
            if (top instanceof Stone) {
                if (top.name === value) {
                    break;
                }
            }
        }
    }

    protected call() {
        let [second, top] = [this.stack[this.stack.length - 2], this.stack[this.stack.length - 1]];
        if (second && second instanceof ReflexObject && top && typeof top === 'string') {
            this.pop();
            this.pop();
            let receiver = second;
            let method = top;
            let result;
            result = receiver.send(method);
            if (result instanceof ReflexFunction) {
                result.frame.self = receiver;
            }
            this.push(result);
        } else {
            dump(this.stack);
            throw new Error("call expects top to be message, second to be recv");
        }
    }

    protected ret() {
        let frame = this.frames[this.frames.length - 1];
        this.frames.pop();
        this.frames.pop();
        if (frame.retValue) {
            this.push(frame.retValue);
        } else {
            if (this.stackIsEmpty()) {
                this.push(this.makeNil());
            }
        }
    }

    private lambdaCount: number = 0;
    protected compile(ast: Tree) {
        if (ast instanceof Defun || ast instanceof FunctionLiteral) {
            let label = `lambda-${this.lambdaCount++}`;
            let name = label;
            if (ast instanceof Defun) {
                name = ast.name.key;
            }
            let code: Code = [
                ['label', label],
                ...ast.shell,
            ];
            this.machine.sideload(code);
            let fn = this.makeFunction() as ReflexFunction;
            fn.name = name;
            fn.label = label;
            fn.source = ast.inspect()
            fn.params = ast.params.items.flatMap((param: Parameter) => {
                if (param instanceof Parameter) {
                    if (param.reference) {
                        if (fn.blockParamName) {
                            throw new Error("should only have one block param, found " + param.name + " and " + fn.blockParamName)
                        }
                        fn.blockParamName = param.name;
                        return [];
                    } else {
                        return [param.name];
                    }
                } else {
                    throw new Error("expected parameter, got " + param);
                }
            });
            fn.arity = fn.params.length;
            let frame = this.frames[this.frames.length - 1]
            fn.frame = { ...frame };
            this.push(fn);
        }
        else {
            fail('compile only impl for defun/fun lit');
        }
    }

    private invokeReflex(top: ReflexFunction, args: Value[], hasBlock: boolean, ensureReturns?: ReflexObject) {
        let ip = indexForLabel(this.code, top.label);
        let frame = this.frames[this.frames.length - 1];
        let self = frame.self as ReflexObject;
        let locals = Object.fromEntries(zip(top.params, args));
        let block;
        if (hasBlock) {
            block = this.stack[this.stack.length - 1] as ReflexFunction;
            this.pop();
        }
        if (top.frame.self) {
            self = top.frame.self.within(self);
        }
        if (block && top.blockParamName) {
            locals[top.blockParamName] = block;
        }
        let newFrame: Frame = {
            ip,
            locals,
            self,
            ...(ensureReturns ? { retValue: ensureReturns } : {}),
            currentMethod: top,
            ...(hasBlock ? { block } : {}),
        };
        let nihilate = false;
        if (top.frame.block) {
            newFrame.ip = top.frame.ip;
        }
        if (hasBlock) {
            let line = newFrame.ip;
            let next = nextOperativeCommand(this.code.slice(line));
            if (next) {
                let [nextOp] = next;
                let exhausted = nextOp === 'ret'
                if (exhausted) {
                    nihilate = true;
                }
            } else {
                throw new Error("could not determine next upcoming command? (at least a halt should be present...?)")
            }
        }
        if (!nihilate) {
            this.frames.push(top.frame);
            this.frames.push(newFrame);
        } else {
            if (block) {
                let nil = this.makeNil();
                this.invokeReflex(block, [nil], false);
            } else {
                throw new Error("tried to pass nihil to a block, but there wasn't a block??")
            }
        }
    }
    
    protected sendEq(value: string) {
        let k = value as string;
        let recv = this.stack[this.stack.length - 1];
        this.pop();
        let obj = this.stack[this.stack.length - 1];
        this.pop();
        if (obj instanceof ReflexObject) {
            if (recv instanceof ReflexObject) {
                if (this.frames[this.frames.length - 1].self === recv) {
                    recv.set(k, obj)
                } else {
                    throw new Error("can't set attrs on nonself")
                }
            } else {
                fail("send_eq expects top to be receiver (got: " + recv + ")")
            }
        } else {
            fail("send_eq expects second to be object to assign (got: " + obj + ")");
        }
    }

    private dispatch(message: string, object: ReflexObject, doRet?: boolean) {
        let fn = object.send(message) as ReflexFunction;
        this.stack.push(fn);
        let arity = fn.arity;
        this.invoke(arity, !!fn.blockParamName);
        if (doRet) { this.ret(); }
    }

    private stackIsEmpty() { return this.stack.length === 0 }
}

export default Controller;