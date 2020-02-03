let doTrace = false;
export class Configuration {
    trace: boolean = !!process.env.trace || doTrace;  // per-instruction debug logging
    traceDepth: number = Infinity;                           // how deep to trace...
    // traceReturns: boolean = false;                           // how deep to trace...
    // delay: number = -1;                            // pause between instructions in seconds 
}
