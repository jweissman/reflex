import util from 'util';
import { Value } from './instruction/Value';
import Machine from './Machine';
import { Instruction, indexForLabel, Code } from './instruction/Instruction';
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
    get frame() { return this.frames[this.frames.length - 1]; }

    constructor(private machine: Machine) { }

    public makeObject(klass: ReflexClass, args: any[]) { return makeReflexObject(this.machine, klass, args) }
    public makeNil(): ReflexNihil { return this.makeObject(ReflexNihil.klass, []) as ReflexNihil; }
    public makeFunction(): ReflexFunction { return this.makeObject(ReflexFunction.klass, []) as ReflexFunction; }

    execute(instruction: Instruction) {
        let [op, value] = instruction;
        switch (op) {
            case 'label': break;
            case 'halt': this.machine.halted = true; break;
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
                this.localVarSet(value as string)
                break;
            case 'local_var_or_eq':
                let k = value as string;
                let t = this.stack[this.stack.length - 1];
                this.pop()
                if (t instanceof ReflexObject) {
                    let localFrame: Frame = findFrameWithLocal(k, this.frames);
                    if (localFrame === this.frame &&
                        !this.frame.locals[k]) {
                        this.frame.locals[k] = t;
                    }
                } else {
                    fail("local_var_set expects top is reflex obj to assign");
                }
                break;
            case 'bare':
                let v: string = value as string;
                if (hasLocal(v, this.frames)) {
                    this.push(getLocal(v, this.frames));
                } else {
                    this.push(this.frame.self)
                    this.push(value as string)
                    this.call()
                }
                break;
            case 'send':
                let val: string = value as string;
                let result = this.frame.self.send(val);
                this.push(result);
                break;
            case 'send_or_eq':
                let theKey = value as string;
                if (!this.frame.self.respondsTo(theKey)) {
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
                let top = this.machine.top
                this.pop();
                this.dispatch(value as string, top as ReflexObject);
                break;
            default: assertNever(op);
        }
        return;
    }

    localVarSet(key: string) {
        let top = this.stack[this.stack.length - 1];
        // this.pop()
        if (top instanceof ReflexObject) {
            let localFrame: Frame = findFrameWithLocal(key, this.frames);
            localFrame.locals[key] = top;
            // if (top instanceof ReflexFunction && top.name?.match(/lambda/)) {
            //     top.name = top.name + ' [' + key + ']'
            // }
        } else {
            fail("local_var_set expects top is be reflex obj to assign");
        }
    }

    invoke(
        arity: number,
        withBlock: boolean,
        ensureReturns?: ReflexObject
    ) {
        let top = this.stack[this.stack.length - 1];
        this.pop();
        log("Invoking " + top + "..."); 
        debug("  with arity: " + arity);
        debug("  with block? " + withBlock)
        let args = [];
        for (let i = 0; i < arity; i++) {
            let newTop = this.stack[this.stack.length - 1];
            args.push(newTop);
            this.pop();
        }
        if (withBlock) {
            debug("block provided, popping stack and pushing to args...")
            args.push(this.stack[this.stack.length - 1])
            this.pop()
        }
        if (top instanceof ReflexFunction) {
            debug("about to invoke reflex fn " + top + " (with block? " + withBlock +")")
            debug("arity is " + arity + ", actual arg len: " + args.length)
            debug("args: " + args)
            this.invokeReflex(top, args, withBlock || !!top.blockParamName, ensureReturns);
        } else if (top instanceof WrappedFunction) {
            if (top.boundSelf) {
                this.machine.bindSelf(top.boundSelf)
            }
            if (!!top.convertArgs) {
                args = args.map(arg =>
                    arg instanceof ReflexObject
                        ? Converter.castReflexToJavascript(arg)
                        : arg
                );
            }
            let result = top.impl(this.machine, ...args);
            if (result !== undefined) {
                let toPush = this.converter.castJavascriptToReflex(result);
                this.push(toPush)
            }
            if (top.boundSelf) {
                this.machine.unbindSelf()
            }
        } else if (top instanceof ReflexObject) {
            log("FALLBACK TO CALL OBJ...")
            let call = top.send('call');
            args.reverse().forEach(arg => this.push(arg))
            if (call instanceof WrappedFunction) { call.bind(top) }
            if (call instanceof ReflexFunction) { call.frame.self = top }
            this.push(call);
            this.invoke(arity, withBlock, ensureReturns)
        } else {
            throw new Error("Top was not reflex function or object at invoke")
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

    private enableMarkSweep: boolean = true
    protected mark(value: string) {
        log("WOULD MARK FOR " + value)
        if (this.enableMarkSweep) {
            this.push(new Stone(value));
        }
    }

    protected sweep(value: Value) {
        log("WOULD SWEEP FOR " + value)
        if (this.enableMarkSweep) {
            while (!this.stackIsEmpty()) {
                let top = this.stack[this.stack.length - 1];
                this.pop();
                if (top instanceof Stone) {
                    if (top.name === value) {
                        break;
                    }
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
        let top = this.stack[this.stack.length - 1]
        // this.frames.pop();
        this.frames.pop();
        let retValue: Value = null;
        if (frame.retValue) {
            retValue = frame.retValue;
        } else if (top === null || top === undefined || (top instanceof Stone && top.name === 'invoke')) {
            retValue = this.makeNil();
        } else {
            retValue = top;
        }

        if (retValue !== null) {
            log("RET -- returning: " + retValue)
            this.push(retValue);
        } else {
            throw new Error("No ret value at " + frame.currentMethod)
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

private invokeReflex(fn: ReflexFunction, args: Value[], withBlock: boolean, ensureReturns?: ReflexObject) {
        log("Invoking Reflex function " + fn.inspect() + " (called in " + this.frame.currentMethod?.name + ")");
        debug("source: " + fn.source)
        debug("args: " + args)
        // debug("looking for label: " + fn.label)
        if (!fn?.name?.match(/_setup/)) { debugger; }
        // let locals: Store = {};
        let fnArgs = Object.fromEntries(zip(fn.params, args)) //.reverse()))
        if (withBlock) {
            if (args.length && args[args.length - 1]) { //} instanceof ReflexFunction) {
                // log("Method " + fn.name + " (called in " + frame.currentMethod?.name + ") expected a block (?) -- picking from args")
                let block = args[args.length - 1] as ReflexFunction
                args.pop()
                if (fn.blockParamName) {
                    log("Assign BLOCK " + block.source + " to " + fn.blockParamName)
                    fnArgs[fn.blockParamName] = block;
                    fnArgs['block_given'] = getLocal('true', this.frames);
                } else {
                    throw new Error("Given block arg but no explicit block param")
                }
            } else {
                log("Method " + fn.name + " (called in " + this.frame.currentMethod?.name + ") did not get block...")
                // throw new Error("Method " + fn.name + " expected a block")
                // fnArgs['block_given'] = false;
                    fnArgs['block_given'] = getLocal('false', this.frames);
            }
        }
        debug("args: " + util.inspect(fnArgs));
        let self = fn.frame.self ? fn.frame.self.within(this.frame.self) : this.frame.self;
        debug("self: " + self);
        // this.frames.push(fn.frame);
        this.frames.push({
            ip: indexForLabel(this.code, fn.label),
            locals: fnArgs,
            self,
            ...(ensureReturns || fn.frame.retValue ? { retValue: ensureReturns } : {}),
            currentMethod: fn,
            stack: [],
            backingFrame: fn.frame,
        });

        // log("Invoke done!")
        if (!fn?.name?.match(/_setup/)) { debugger; }
    }

    protected sendEq(value: string) {
        let k = value as string;
        let recv = this.stack[this.stack.length - 1];
        this.pop();
        let obj = this.stack[this.stack.length - 1];
        // this.pop();
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

    private dispatch(message: string, object: ReflexObject) { //}, doRet?: boolean) {
        this.push(object);
        this.push(message);
        this.call();
        this.invoke(0, false)
    }

    private stackIsEmpty() { return this.stack.length === 0 }
    // private stackIsEmptyUntil() { return this.stack.length === 0 }
}

export default Controller;