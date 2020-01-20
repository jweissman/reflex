import Reflex from "./Reflex"

const reflex: Reflex = new Reflex()
export default reflex;
export const evaluate = (input: string) => reflex.evaluate(input, true)
export const tracedOutput = () => reflex.tracedOutput
export const out = () => {
    let output = tracedOutput()
    return output[output.length - 1]
}