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
  constructor(public name: Message, public body: Tree, public superclass?: Tree, public arch: boolean = false) {
    super();
  }

  inspect(): string {
    if (this.superclass) {
      return `class ${this.name.inspect()} < ${this.superclass.inspect()} {${this.body.inspect()}}`;
    }
    return `class ${this.name.inspect()} {${this.body.inspect()}}`;
  }

  get code(): Code {
    return [
      ...this.structure.code,
    ];
  }

  private get structure() {
    let newClassArgs: Argument[] = [new Argument(this.name)];
    if (this.superclass) { newClassArgs.push(new Argument(this.superclass)) }
    let defClass = new LocalVarOrEq(
      this.name,
      new SendMethodCall(new Bareword("Class"), new Message("new"), new Arguments(new Sequence<Argument>(newClassArgs)))
    );
    return new Program(new Sequence([
      defClass,
      new SendMethodCall(
        new Bareword(this.name.key), new Message("defineClassMethod"),
        new Arguments(new Sequence([
          new Argument(new Message('_setup')),
          new Argument(
            new FunctionLiteral(new Sequence([]), this.body)
          )
        ]))
      ),
      new SendMethodCall(
        new Bareword(this.name.key), new Message("_setup"),
        new Arguments(new Sequence([])),
      ),
    ]));
  }
}
