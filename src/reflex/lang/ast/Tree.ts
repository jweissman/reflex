import { Code } from '../../vm/instruction/Instruction'

abstract class Tree {
    abstract inspect(): string;
    abstract get code(): Code;
    toString() { return this.inspect()}
}

export default Tree;
