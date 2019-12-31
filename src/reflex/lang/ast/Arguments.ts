import Tree from "./Tree";
import { Sequence } from "./Sequence";
import { Code } from "../../vm/instruction/Instruction";
import { PipedBlock } from "./PipedBlock";
import { log } from "console";

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
  // public blockRef?: Argument; 
  constructor(public args: Sequence<Argument>, public block?: PipedBlock | Argument) {
    super();
    if (!block) {
      let blockArg = this.args.items.find((arg: Argument) => arg.isReference)
      if (blockArg) {
        log("FOUND BLOCK ARG: " + blockArg)
        this.args.items = this.args.items.filter(arg => arg.isReference)
        this.block = blockArg;
      }
    }
    // console.log("CREATE ARGUMENTS", { args, block }); 
  }
  inspect(): string {
    let disp = this.args.inspect();
    if (this.block && this.block instanceof PipedBlock) {
      disp += this.block.inspect();
    }
    return disp;
  }
  get code(): Code {
    if (this.block && this.block instanceof PipedBlock) {
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
