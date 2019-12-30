import reflex, { evaluate } from "./SpecHelper"
describe('Reflex', () => {
    describe("syntax", () => {
        it('permits bare args', () => {
            expect(evaluate("Bar = Class.new 'Bar'")).toEqual("Class(Bar)")
            expect(evaluate("Baz = Class.new 'Baz', Bar")).toEqual("Class(Baz)")
            expect(evaluate("Baz.super")).toEqual("Class(Bar)")
        })

        it('permits bare params', () => {
            expect(evaluate("parent=klass=>klass.super")).toMatch("Function")
            expect(evaluate("parent(Object)")).toMatch("Class(Object)")
            expect(evaluate("parent(Class.new('Bar', Class.new('Baz')))")).toMatch("Class(Baz)")
        });

        it('barecalls fall back to self', () => {
            evaluate("class Bar{there(){Function}}")
            evaluate("class Bar{baz(){there()}}")
            expect(() => evaluate("Bar.new().baz()")).not.toThrow()
            expect(evaluate("Bar.new().baz()")).toEqual("Class(Function)")
        })

        it('defines multiple functions in a class stmt', () => {
            evaluate("class Bar{a(){b()};b(){c()};c(){Class}}");
            evaluate("bar=Bar.new()");
            expect(evaluate("bar.a()")).toEqual("Class(Class)")
        })

        describe("negative tests", () => {
            afterEach(() => reflex.hardReset());
            it('barewords do not fall back to self', () => {
                evaluate("class Bar{baz(){self.there=Class; there}}")
                expect(() => evaluate("Bar.new().baz()")).toThrow()
            })
        })

        describe("blocks", () => {
            it('modifies locals', () => {
                evaluate('x=Class')
                evaluate('mod(){x=Object}')
                expect(evaluate("x")).toEqual("Class(Class)")
                evaluate('mod()')
                expect(evaluate("x")).toEqual("Class(Object)")
            })
            it('yields successive values', () => {
                evaluate("gen(){yield Object; yield Class}")
                evaluate("x=Function");
                expect(evaluate("x")).toEqual("Class(Function)")
                evaluate("gen(){|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Object)")
                evaluate("gen(){|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Class)")
                // expect(evaluate("gen {|val|x=val};x")).toEqual("Nil")
            })

            it("funcalls with only blocks", () => {
                evaluate("g(){yield Object; yield Class; yield Function}")
                evaluate("x=Function")
                evaluate("g{|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Object)")
                evaluate("g{|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Class)")
                evaluate("g{|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Function)")
            })

            it('creates a generator factory', () => {
                evaluate("thrice=(x)=>()=>{yield x; yield x; yield x; yield Class}")
                evaluate("x=Function")
                evaluate("three_obj = thrice(Object)")
                evaluate("three_obj{|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Object)")
                evaluate("three_obj{|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Object)")
                evaluate("three_obj{|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Object)")
                evaluate("three_obj{|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Class)")
            })

            it('gives access to the block within the function', () => {
                evaluate("x=Object; y=Object")
                evaluate("twice() { x=block(); y=block() }") // should be able to specify block name...
                evaluate("twice {Function}")
                expect(evaluate("x")).toEqual("Class(Function)")
                expect(evaluate("y")).toEqual("Class(Function)")
            })

            test.todo("passes blocks to instances methods")

        })

        describe("super", () => {
            test.todo("is the current method's super-method")
        })
    })

    describe('main', () => {
        it('is an object', () => {
            expect(evaluate("self")).toEqual("Main")
        })
        it('has a class', () => {
            expect(evaluate("Main")).toEqual("Class(Main)")
        })
        it('has a class that is a class', () => {
            expect(evaluate("Main.class")).toEqual("Class(Class)")
        })
        it('descends from object', () => {
            expect(evaluate("Main.super")).toEqual("Class(Object)")
        })

        it('local variables', () => {
            evaluate("Obj = Object")
            expect(evaluate("Obj")).toEqual("Class(Object)")
            expect(evaluate("Obj.class")).toEqual("Class(Class)")
            evaluate("o = Object.new()")
            expect(evaluate("o")).toEqual("Object")
            expect(evaluate("o.class")).toEqual("Class(Object)")
            // they are not defined on main but 'merely' in local scope / frame 
            // (so inherited into child scopes but not living on the object as such...)
            expect(()=>evaluate("self.o")).toThrow()
        })
    })

})