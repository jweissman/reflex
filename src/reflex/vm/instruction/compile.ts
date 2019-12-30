import { Code } from "./Instruction";
import { ReflexFunction } from '../types/ReflexFunction';
import Tree from '../../lang/ast/Tree';
import { Defun } from '../../lang/ast/Defun';
import { FunctionLiteral } from '../../lang/ast/FunctionLiteral';
import { Stack } from '../Stack';
import { fail } from '../util/fail';
import ReflexClass from '../types/ReflexClass';
import { Bareword } from '../../lang/ast/Bareword';
import Machine from '../Machine';
import { log } from "../util/log";
import { Message } from "../../lang/ast/Message";

export let lambdaCount = 0;
export function compile(ast: Tree, stack: Stack, meta: Machine) {
    log("COMPILE " + ast.inspect());
    if (ast instanceof Defun || ast instanceof FunctionLiteral) {
        let label = `lambda-${lambdaCount++}`;
        let name = label;
        let arity = ast.params.length;
        if (ast instanceof Defun) {
            name = ast.name.key;
        }
        let code: Code = [
            ['label', label],
            ...ast.shell,
        ];
        meta.sideload(code);
        let fn = ReflexClass.makeInstance(meta, ReflexFunction.klass, []) as ReflexFunction; //, [name, label])
        fn.name = name;
        fn.label = label;
        fn.arity = arity;
        fn.params = ast.params.map(param =>  {
            if (param instanceof Bareword) {
                return param.word;
            } else if (param instanceof Message) {
                return param.key;
            } else {
                throw new Error("param wasn't bareword/message: " + param.inspect());
            }
            // (param as Bareword).word
        });
        let frame = meta.frames[meta.frames.length - 1]
        // fn.locals = frame.locals
        // fn.self = frame.self
        fn.frame = { ...frame };
        log("COMPILE'D " + fn.inspect() + " arity: " + fn.arity);
        log(" params: " + fn.params);
        stack.push(fn);
    }
    else {
        fail('compile only impl for defun/fun lit');
    }
}
