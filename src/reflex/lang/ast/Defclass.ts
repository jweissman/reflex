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
import SendMessageEq from "./SendMessageEq";
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
      let newClassArgs: Tree[] = [this.name];
      if (this.superclass) { newClassArgs.push(this.superclass) }
      if (this.superclass) { newClassArgs.push(new Message('Object')) }
      // newClassArgs.push(this.body)
      let defClass = new LocalVarOrEq(
          this.name,
          new SendMethodCall(new Bareword("Class"), new Message("new"), new Arguments(new Sequence(newClassArgs)))
      );
      let newBody = ((this.body as Program).lines as Sequence).map((maybeMethod) => {
          if (maybeMethod instanceof Defun) {
            let defun = maybeMethod as Defun;
            defun.compileOnly = true;
            // return new SendMessageEq(new Bareword('self'), defun.name, defun)
            return new SendMethodCall(
              new Bareword('self'), new Message("defineMethod"),
              new Arguments(new Sequence([defun.name, defun]))
            );
          } else {
            return maybeMethod;
              // throw new Error("expected each line in class body to be defun?")
          }
        })
        return new Program(new Sequence([
          defClass,
          new SendMethodCall(
              new Bareword(this.name.key), new Message("defineClassMethod"),
              new Arguments(new Sequence([new Message('_setup'),
                new Defun(new Message("_setup"), new Sequence([]), new Program(new Sequence(newBody)))
              ]))
          ),
          new SendMethodCall(
              new Bareword(this.name.key), new Message("_setup"),
              new Arguments(new Sequence([])),
              // new Arguments(new Sequence([new Message('_setup'), this.body]))
          ),
        ])); //,...defMethods]));
    }
    get code(): Code {
        return [
            // ['label', ``]
            ...this.structure.code,
            ['local_var_get', this.name.key],
        ];
    }
}
