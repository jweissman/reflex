import { evaluate } from "./SpecHelper"

describe('Range', () => {
    it('is the class of intervals', () => {
        expect(evaluate("Range")).toEqual('Class(Range)')
    })

    it('is the class of intervals', () => {
        expect(evaluate("Range.new(0,10)")).toEqual('0..10')
    })

    it('shorthand', () => {
        expect(evaluate("0..100")).toEqual("0..100")
    })

    describe('step', () => {
        it('sets increment', () => {
            expect(evaluate("0..10.step(3).toArray()")).toEqual([0, 3, 6, 9])
        })
    })

    it('enumerates', () => {
        expect(evaluate("(1..20).step(3).map { |x| x*x + 2*x + 1 }.collect()")).toEqual([4, 25, 64, 121, 196, 289, 400])
    })
    it('enumerates in reverse', () => {
        expect(evaluate("(20..1).step(4).collect()")).toEqual([20, 16, 12, 8, 4])
        expect(evaluate("(20..1).step(4).collect()")).toEqual([20, 16, 12, 8, 4])
    })
    it('enumerates with index + map stably', () => {
        evaluate('poly=x=>x*x+2*x+1')
        expect(evaluate("1..3.map(&poly).withIndex()")).toEqual([[4, 0], [9, 1], [16, 2]])
        expect(evaluate("1..3.map(&poly).withIndex()")).toEqual([[4, 0], [9, 1], [16, 2]])
        expect(evaluate("1..3.map(&poly).withIndex()")).toEqual([[4, 0], [9, 1], [16, 2]])
    })
})
