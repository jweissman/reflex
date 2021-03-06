import { evaluate } from "./SpecHelper"

describe('Number', () => {
    it('is the class of numeric values', () => {
        expect(evaluate("Number")).toEqual("Class(Number)")
        expect(evaluate("Number.class")).toEqual("Class(Class)")
    })

    it('integers', () => {
        expect(evaluate("1")).toEqual(1)
        expect(evaluate("1.class")).toEqual("Class(Integer)")
    })

    it('floats', () => {
        expect(evaluate("1.5")).toEqual(1.5)
        expect(evaluate("1.5.class")).toEqual("Class(Float)")
    })

    describe('zero', () => {
        it('is an integer', () => {
            expect(evaluate("0")).toEqual(0)
            expect(evaluate("0.class")).toEqual("Class(Integer)")
        })
        it('is an identity for addition', () => {
            expect(evaluate("0.add(0)")).toEqual(0)
            expect(evaluate("0.add(0).add(0)")).toEqual(0)
            expect(evaluate("1.add(0)")).toEqual(1)
            expect(evaluate("1.add(0).add(0)")).toEqual(1)
        })
        it('is an absorbing element for multiplication', () => {
            expect(evaluate("0.multiply(0)")).toEqual(0)
            expect(evaluate("1.multiply(0)")).toEqual(0)
            expect(evaluate("2.multiply(0)")).toEqual(0)
        })
        it('eq itself', () => {
            expect(evaluate("0.eq(0)")).toEqual(true)
            expect(evaluate("0.eq(1)")).toEqual(false)
        })
    })
    describe('one', () => {
        it('is a number', () => {
            expect(evaluate("1")).toEqual(1)
            expect(evaluate("1.class")).toEqual("Class(Integer)")
        })
        it('is an additive successor', () => {
            expect(evaluate("1.add(1)")).toEqual(2)
            expect(evaluate("1.add(1).add(1)")).toEqual(3)
        })
        it('is an identity for multiplication', () => {
            expect(evaluate("1.multiply(0)")).toEqual(0)
            expect(evaluate("1.multiply(1)")).toEqual(1)
            expect(evaluate("1.multiply(2)")).toEqual(2)
        })
        it('eq itself', () => {
            expect(evaluate("1.eq(1)")).toEqual(true)
            expect(evaluate("1.eq(0)")).toEqual(false)
        })
        it('gt', () => {
            expect(evaluate("1.gt(0)")).toEqual(true)
            expect(evaluate("0.gt(1)")).toEqual(false)
        })
        it('lt', () => {
            expect(evaluate("0.lt(1)")).toEqual(true)
            expect(evaluate("1.lt(0)")).toEqual(false)
        })
        it('gte', () => {
            expect(evaluate("1.gte(0)")).toEqual(true)
            expect(evaluate("1.gte(1)")).toEqual(true)
            expect(evaluate("0.gte(1)")).toEqual(false)
        })
        it('lte', () => {
            expect(evaluate("0.lte(1)")).toEqual(true)
            expect(evaluate("1.lte(1)")).toEqual(true)
            expect(evaluate("1.lte(0)")).toEqual(false)
        })
    })

    describe('integer arithmetic', () => {
        it('negate', () => {
            expect(evaluate("0.negate()")).toEqual(-0)
            expect(evaluate("2.negate()")).toEqual(-2)
            // negation convolutes
            expect(evaluate("1.negate().negate()")).toEqual(1)
        })
        it('add', () => {
            expect(evaluate("2.add(2).eq(4)")).toEqual(true)
            expect(evaluate("2.add(2).eq(5)")).toEqual(false)
            expect(evaluate("1.add(2).add(3).add(4).eq(10)")).toEqual(true)
            expect(evaluate("1.add(2).add(3).add(4).eq(11)")).toEqual(false)
        })

        it('subtract', () => {
            expect(evaluate("2.subtract(2).eq(0)")).toEqual(true)
            expect(evaluate("2.subtract(2).eq(1)")).toEqual(false)
            expect(evaluate("1.subtract(10).eq(-9)")).toEqual(true)
            // expect(evaluate("1.(2).add(3).add(4).eq(11)")).toEqual(false)
        })

        it('multiply', () => {
            expect(evaluate("2.multiply(2).eq(4)")).toEqual(true)
            expect(evaluate("2.multiply(2).eq(5)")).toEqual(false)
            expect(evaluate("2.multiply(5).eq(10)")).toEqual(true)
            expect(evaluate("2.multiply(5).eq(11)")).toEqual(false)
        })

        it('divide', () => {
            expect(evaluate("2.divide(2).eq(1)")).toEqual(true)
            expect(evaluate("2.divide(2).eq(2)")).toEqual(false)
            expect(evaluate("10.divide(2).eq(5)")).toEqual(true)
            expect(evaluate("10.divide(5).eq(2)")).toEqual(true)
            expect(evaluate("10.divide(5).eq(1)")).toEqual(false)
        })

        describe('operators', () => {
            describe('math', () => {
                it('sum', () => {
                    expect(evaluate("2+2")).toEqual(4)
                    expect(evaluate("2+3")).toEqual(5)
                    expect(evaluate("0+0")).toEqual(0)
                    expect(evaluate("1234+4321")).toEqual(5555)
                })
                it('difference', () => {
                    expect(evaluate("2-2")).toEqual(0)
                    expect(evaluate("2-1")).toEqual(1)
                    expect(evaluate("2-3")).toEqual(-1)
                    expect(evaluate("0-0")).toEqual(0)
                    expect(evaluate("9876-4321")).toEqual(5555)
                })
                it('product', () => {
                    expect(evaluate("2*2")).toEqual(4)
                    expect(evaluate("2*3")).toEqual(6)
                    expect(evaluate("0*0")).toEqual(0)
                    expect(evaluate("1234*4321")).toEqual(5332114)
                })
                it('quotient', () => {
                    expect(evaluate("2/2")).toEqual(1)
                    expect(evaluate("4/2")).toEqual(2)
                    expect(evaluate("100/5")).toEqual(20)
                    expect(evaluate("1/0")).toEqual(Infinity)
                    expect(evaluate("0/0")).toEqual(NaN)
                })
                it('exponent', () => {
                    expect(evaluate("2^2")).toEqual(4)
                    expect(evaluate("2^8")).toEqual(256)
                    expect(evaluate("8^2")).toEqual(64)
                    expect(evaluate("3^2")).toEqual(9)
                    expect(evaluate("4^2")).toEqual(16)
                    expect(evaluate("11^2")).toEqual(121)
                    expect(evaluate("121^2")).toEqual(14641)
                })
            })

            it('precedence', () => {
                expect(evaluate("2+2*3")).toEqual(8)
                expect(evaluate("2+2*3-1")).toEqual(7)
            })

            it('precedence w variables', () => {
                evaluate('x=2')
                expect(evaluate("2+3*x")).toEqual(8)
                expect(evaluate("2+3*x-1")).toEqual(7)
            })
        })
    })

    describe('times', () => {
        it('iterates', () => {
            expect(evaluate('1.times { 0 }')).toEqual([0])
        })
        it('recurse', () => {
            expect(evaluate('1.times { 1.times { 0 } }')).toEqual([[0]])
        })
    })
})