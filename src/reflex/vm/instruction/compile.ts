import { Code } from "./Instruction";
import { ReflexFunction } from '../types/ReflexFunction';
import Tree from '../../lang/ast/Tree';
import { Defun } from '../../lang/ast/Defun';
import { FunctionLiteral } from '../../lang/ast/FunctionLiteral';
import { Stack } from '../Stack';
import { fail } from '../util/fail';
import ReflexClass from '../types/ReflexClass';
import Machine from '../Machine';
import { log } from "../util/log";
import { Parameter } from "../../lang/ast/Parameter";

export let lambdaCount = 0;
export function compile(ast: Tree, stack: Stack, machine: Machine) {
    log("COMPILE " + ast.inspect());
    if (ast instanceof Defun || ast instanceof FunctionLiteral) {
        let label = `lambda-${lambdaCount++}`;
        let name = label;
        if (ast instanceof Defun) {
            name = ast.name.key;
        }
        let code: Code = [
            ['label', label],
            ...ast.shell,
        ];
        machine.sideload(code);
        let fn = ReflexClass.makeInstance(machine, ReflexFunction.klass, []) as ReflexFunction; //, [name, label])
        fn.name = name;
        fn.label = label;
        fn.source = ast.inspect()
        // fn.
        fn.params = ast.params.items.flatMap((param: Parameter) =>  {
            if (param instanceof Parameter) {
                if (param.reference) {
                    if (fn.blockParamName) {
                        throw new Error("should only have one block param, found " + param.name + " and " + fn.blockParamName)
                    }
                    fn.blockParamName = param.name;
                    log("Found block param " + param.name)
                    return [];
                } else {
                    return [param.name];
                }
            } else {
                throw new Error("expected parameter, got " + param);
            }
        });
        fn.arity = fn.params.length;
        let frame = machine.frames[machine.frames.length - 1]
        fn.frame = { ...frame };
        log("COMPILE'D " + fn.inspect() + " / arity: " + fn.arity + " / params: " + fn.params);
        stack.push(fn);
    }
    else {
        fail('compile only impl for defun/fun lit');
    }
}
