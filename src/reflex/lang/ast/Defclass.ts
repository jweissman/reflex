import Tree from "./Tree";
import { Program } from "./Program";
import { Bareword } from "./Bareword";
import { Sequence } from "./Sequence";
import { SendMethodCall } from "./SendMethodCall";
import { Message } from "./Message";
import { SendMessageOrEq, LocalVarOrEq } from "./SendMessageEq";
import { Code } from "../../vm/instruction/Instruction";
import { Defun } from "./Defun";
import { SendMessage } from "./SendMessage";
import LocalVarSet from "./LocalVarSet";
import { log } from "../../vm/util/log";
export class Defclass extends Tree {
  constructor(public name: Message, public body: Tree) {
    super();
  }
  inspect(): string {
    return `class ${this.name.inspect()} {${this.body.inspect()}}`;
  }

  get structure() {
      let defClass = new LocalVarOrEq(
          this.name,
          new SendMethodCall(new Bareword("Class"), new Message("new"), new Sequence([this.name]))
      );
      let defMethods = ((this.body as Program).lines as Sequence).map((methodDef) => {
          if (methodDef instanceof Defun) {
            let defun = methodDef as Defun;
            defun.compileOnly = true;
            log("DEF METHOD " + defun.name + defun.block.inspect())
            return new SendMethodCall(new Bareword(this.name.key), new Message("defineMethod"), new Sequence([defun.name, defun]));
          } else {
              log("expected method def (Defun) but got: " + methodDef.inspect())
              throw new Error("expected each line in class body to be defun?")
          }
        })
        let program = new Program(
            new Sequence([
                defClass,
                ...defMethods,
            ])
        );
        log("WOULD RETURN CLASS PROG: " + program.inspect())
        return new Program(new Sequence([defClass,...defMethods]));
    }
    get code(): Code {
        return [
            // ['mark', this.name.key],
            ...this.structure.code,
            // ['sweep', this.name.key],
            ['local_var_get', this.name.key],
            // ...new G
            // ...new SendMessage(new Bareword("self"), this.name).code,
        ];
    }
}
