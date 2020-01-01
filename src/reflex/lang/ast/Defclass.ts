import Tree from "./Tree";
import { Program } from "./Program";
import { Bareword } from "./Bareword";
import { Sequence } from "./Sequence";
import { SendMethodCall } from "./SendMethodCall";
import { Message } from "./Message";
import { LocalVarOrEq } from "./LocalVarOrEq";
import { Code } from "../../vm/instruction/Instruction";
import { Defun } from "./Defun";
import { Arguments, Argument } from "./Arguments";
import { FunctionLiteral } from "./FunctionLiteral";

export class Defclass extends Tree {
  constructor(public name: Message, public body: Tree, public superclass?: Message) {
    super();
  }

  inspect(): string {
    if (this.superclass) {
      return `class ${this.name.inspect()} < ${this.superclass.inspect()} {${this.body.inspect()}}`;
    }
    return `class ${this.name.inspect()} {${this.body.inspect()}}`;
  }

  get structure() {
    let newClassArgs: Argument[] = [new Argument(this.name)];
    if (this.superclass) { newClassArgs.push(new Argument(this.superclass)) }
    let defClass = new LocalVarOrEq(
      this.name,
      new SendMethodCall(new Bareword("Class"), new Message("new"), new Arguments(new Sequence<Argument>(newClassArgs)))
    );
    let newBody = ((this.body as Program).lines as Sequence<Defun>).map((maybeMethod) => {
      if (maybeMethod instanceof Defun) {
        let defun = maybeMethod as Defun;
        defun.compileOnly = true;
        return new SendMethodCall(
          new Bareword('self'), new Message("defineMethod"),
          new Arguments(new Sequence([new Argument(defun.name), new Argument(
            new FunctionLiteral(defun.params, defun.block)
          )]))
        );
      } else {
        return maybeMethod;
      }
    })
    return new Program(new Sequence([
      defClass,
      // new LocalVarGet(this.name),
      new SendMethodCall(
        new Bareword(this.name.key), new Message("defineClassMethod"),
        new Arguments(new Sequence([
          // new Argument(new Bareword('_setup')),
          // new Argument(new Message('_setup')),
          new Argument(new Message('_setup')),
          new Argument(
            new FunctionLiteral(new Sequence([]), new Program(new Sequence(newBody)))
          )
        ]))
      ),
      new SendMethodCall(
        new Bareword(this.name.key), new Message("_setup"),
        new Arguments(new Sequence([])),
      ),
    ]));
  }
  get code(): Code {
    return [
      ...this.structure.code,
      // ['local_var_get', this.name.key],
    ];
  }
}
