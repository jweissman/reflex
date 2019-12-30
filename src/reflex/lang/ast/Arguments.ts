import Tree from "./Tree";
import { Sequence } from "./Sequence";
import { Code } from "../../vm/instruction/Instruction";
import { PipedBlock } from "./PipedBlock";
export class Arguments extends Tree {
  constructor(public args: Sequence, public block?: PipedBlock) {
    super();
    // log("CREATE ARGS: " + args.inspect())
    if (this.block && this.block instanceof PipedBlock) {
      // log("!!! CREATE ARGS WITH BLOCK: " + this.block.inspect())
    }
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
        // ...(this.block !== undefined && this.block.code.length ? this.block.code : []), //this.block.code : []),
        ...this.args.code,
      ];
    }
  }
}
