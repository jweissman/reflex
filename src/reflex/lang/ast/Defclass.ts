import Tree from "./Tree";
import { Program } from "./Program";
import { Bareword } from "./Bareword";
import { Sequence } from "./Sequence";
import { SendMethodCall } from "./SendMethodCall";
import { Message } from "./Message";
import SendMessageEq from "./SendMessageEq";
import { Code } from "../../vm/Instruction";
import { Defun } from "./Defun";
import { SendMessage } from "./SendMessage";
import LocalVarSet from "./LocalVarSet";
export class Defclass extends Tree {
  constructor(public name: Message, public body: Tree) {
    super();
  }
  inspect(): string {
    return `class ${this.name.inspect()} ${this.body.inspect()}`;
  }
  get structure() {
      let defClass = new SendMessageEq(
          new Bareword("self"),
          this.name, new SendMethodCall(new Bareword("Class"), new Message("new"), new Sequence([this.name]))
      );
      let defMethods = ((this.body as Program).lines as Sequence).map((methodDef) => {
            let defun = methodDef as Defun;
            defun.compileOnly = true;
            return new SendMethodCall(new Bareword(this.name.key), new Message("defineMethod"), new Sequence([defun.name, defun]));
        })
        return new Program(
            new Sequence([
                defClass,
                ...defMethods,
            ])
        );
    }
    get code(): Code {
        return [
            ['mark', this.name.key],
            ...this.structure.code,
            ['sweep', this.name.key],
            ...new SendMessage(new Bareword("self"), this.name).code,
        ];
    }
}
