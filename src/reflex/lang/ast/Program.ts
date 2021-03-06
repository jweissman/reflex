import Tree from './Tree';
import { Sequence } from './Sequence';
export class Program extends Tree {
    constructor(public lines: Sequence<Tree>) { super(); }
    get code() { return this.lines.code }
    inspect() {
        let inspectedLines = (this.lines as Sequence<Tree>).map(line => line.inspect());
        return "PROG:" + inspectedLines.length ? inspectedLines.join("; ") : '{}'
    }
}
