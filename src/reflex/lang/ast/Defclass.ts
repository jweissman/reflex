import Tree from "./Tree";
import { Program } from "./Program";
import { Bareword } from "./Bareword";
import { Sequence } from "./Sequence";
import { SendMethodCall } from "./SendMethodCall";
import { Message } from "./Message";
import { LocalVarOrEq } from "./LocalVarOrEq";
import { Code } from "../../vm/instruction/Instruction";
import { Defun } from "./Defun";
import { Arguments } from "./Arguments";
export class Defclass extends Tree {
  constructor(public name: Message, public body: Tree, public superclass?: Message) {
    super();
  }
  inspect(): string {
    if(this.superclass) { 

      return `class ${this.name.inspect()} < ${this.superclass.inspect()} {${this.body.inspect()}}`;
    }
    return `class ${this.name.inspect()} {${this.body.inspect()}}`;
  }

  get structure() {
      let newClassArgs = [this.name];
      if (this.superclass) { newClassArgs.push(this.superclass) }
      let defClass = new LocalVarOrEq(
          this.name,
          new SendMethodCall(new Bareword("Class"), new Message("new"), new Arguments(new Sequence(newClassArgs)))
      );
      let defMethods = ((this.body as Program).lines as Sequence).map((methodDef) => {
          if (methodDef instanceof Defun) {
            let defun = methodDef as Defun;
            defun.compileOnly = true;
            return new SendMethodCall(
              new Bareword(this.name.key), new Message("defineMethod"),
              new Arguments(new Sequence([defun.name, defun]))
            );
          } else {
              throw new Error("expected each line in class body to be defun?")
          }
        })
        return new Program(new Sequence([defClass,...defMethods]));
    }
    get code(): Code {
        return [
            ...this.structure.code,
            ['local_var_get', this.name.key],
        ];
    }
}
