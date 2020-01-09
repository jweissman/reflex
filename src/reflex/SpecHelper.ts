import Reflex from "./Reflex"

const reflex: Reflex = new Reflex()
export default reflex;
export const evaluate = (input: string) => reflex.evaluate(input)