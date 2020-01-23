import { evaluate } from "./SpecHelper"

describe('String', () => {
    it('is the class of words', () => {
        expect(evaluate("'hello'.class")).toEqual('Class(String)')
        expect(evaluate("'world'.class")).toEqual('Class(String)')
    })

    describe('instance methods', () => {
        it('concat', () => {
            expect(evaluate("'hello'.concat(' world')")).toEqual("hello world")
        })
        it('length', () => {
            expect(evaluate("'hello'.length()")).toEqual(5)
        })
        it('eq', () => {
            expect(evaluate("'hello'.eq('hello')")).toEqual(true)
            expect(evaluate("'hello'.eq('world')")).toEqual(false)
            expect(evaluate("'world'.eq('world')")).toEqual(true)
        })

        it('reverse', () => {
            expect(evaluate("'hello'.reverse().eq('olleh')")).toEqual(true)
            expect(evaluate("'hello'.eq('olleh'.reverse())")).toEqual(true)
            expect(evaluate("'hello'.reverse().reverse().eq('hello')")).toEqual(true)
            expect(evaluate("'hello'.eq('hello'.reverse().reverse())")).toEqual(true)
        })

        xit('call', () => {
            expect(evaluate("'add'.call(1,2)")).toEqual(3)
        })

        xit('add calls concat with correct args', () => {
            expect(evaluate("'add'.call('hello', 'world')")).toEqual('hello world')
        })
    })

    describe('operators', () => {
        it('add is concat', () => {
            expect(evaluate("'hello' + ' world'")).toEqual("hello world")
        })

        it('multiply is replicate', () => {
            expect(evaluate("'hello' * 3")).toEqual("hellohellohello")
        })
    })

    describe('escapes', () => {
        it('unicode escapes', () => {
            evaluate(`code(value) { "\\u001b[" + value + "m" }`)
            expect(evaluate("code('123')")).toEqual("\u001b[123m")
            expect(evaluate("code('31')+'town'+code('0')")).toEqual("\u001b[31mtown\u001b[0m");
        })
    })
})