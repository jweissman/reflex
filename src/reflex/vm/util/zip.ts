export function zip(a: any[], b: any[]) {
    return a.map((value, index) => [value, b[index]]);
}
