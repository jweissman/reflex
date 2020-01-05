import Tree from "./Tree";
import { Sequence } from "./Sequence";
import { Code } from "../../vm/instruction/Instruction";
import { PipedBlock } from "./PipedBlock";

export class Argument extends Tree {
  constructor(public value: Tree, public isReference: boolean = false) { super();}
  inspect(): string {
    return this.value.inspect();
  }
  get code(): Code {
    return this.value.code;
  }
}

export class Arguments extends Tree {
  constructor(public args: Sequence<Argument>, public block?: PipedBlock | Argument) {
    super();
    if (!block) {
      let blockArg = this.args.items.find((arg: Argument) => arg.isReference)
      if (blockArg) {
        this.args.items = this.args.items.filter(arg => arg.isReference)
        this.block = blockArg;
      }
    }
  }

  get length() { return this.args.length}

  inspect(): string {
    let disp = this.args.inspect();
    if (this.block && this.block instanceof Tree) {
      disp += this.block.inspect();
    }
    return disp;
  }

  get code(): Code {
    if (this.block && this.block instanceof Tree) {
      return [
        ...this.block.code,
        ...this.args.code,
      ];
    }
    else {
      return [
        ...this.args.code,
      ];
    }
  }
}
