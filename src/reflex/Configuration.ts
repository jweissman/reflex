let doTrace = false;
export class Configuration {
    trace: boolean = !!process.env.trace || doTrace;  // per-instruction debug logging
    // delay: number = -1;                            // pause between instructions in seconds 
}
