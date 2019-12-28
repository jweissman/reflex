export function fail(err: string) {
    throw new Error("Machine failure: " + err);
}
