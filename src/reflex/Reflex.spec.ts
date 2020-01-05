import reflex, { evaluate } from "./SpecHelper"
describe('Reflex', () => {
    describe("concepts", () => {
        // waiting at least on strings/symbols and equality...
        describe("message dispatch", () => {
            test.todo("method_missing")
            test.todo("responds_to")
        })
    })
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

        it('barewords fall back to self', () => {
            evaluate("class Bar{baz(){self.there=Class; there}}")
            expect(evaluate("Bar.new().baz()")).toEqual("Class(Class)")
        })

        // was just a sanity check, can probably remove this
        it("dot access never falls back", () => {
            evaluate("class Ladder { climb() { Class }}")
            evaluate("fall=Object")
            expect(evaluate("Ladder.new().climb()")).toEqual("Class(Class)")
            expect(()=>evaluate("Ladder.new().fall")).toThrow()
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

                evaluate("three_fn = thrice(Function)")
                evaluate("three_fn{|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Function)")
                evaluate("three_fn{|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Function)")
                evaluate("three_fn{|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Function)")
                evaluate("three_fn{|val|x=val}")
                expect(evaluate("x")).toEqual("Class(Class)")
            })

            it("passes args and blocks", () => {
                evaluate("dispatch(x,&block) { block(x); }")
                evaluate("y=Class")
                evaluate("dispatch(Object) { |val| y = val }")
                expect(evaluate("y")).toEqual("Class(Object)")
                evaluate("dispatch(Function) { |val| y = val }")
                expect(evaluate("y")).toEqual("Class(Function)")
            })

            it("passes blocks to instance methods", () => {
                evaluate("class Baz{next(){yield Object;yield Class; yield Function}}")
                evaluate("baz=Baz.new()")
                evaluate("x=nil")
                evaluate("baz.next { |v| x=v }")
                expect(evaluate("x")).toEqual("Class(Object)")
                evaluate("baz.next { |v| x=v }")
                expect(evaluate("x")).toEqual("Class(Class)")
                evaluate("baz.next { |v| x=v }")
                expect(evaluate("x")).toEqual("Class(Function)")
            })

            describe('unary ampersand', () => {
                it('binds a block parameter', () => {
                    evaluate("x=Object; y=Object")
                    evaluate("twice(&block) { x=block(); y=block() }")
                    evaluate("twice {Function}")
                    expect(evaluate("x")).toEqual("Class(Function)")
                    expect(evaluate("y")).toEqual("Class(Function)")
                })
                it('passes functions as blocks', () => {
                    evaluate('x=nil')
                    evaluate('f(val){x=val}')
                    evaluate('g(&b){b(Object)}')
                    expect(evaluate("x")).toEqual("Nihil")
                    evaluate('g(&f)')
                    expect(evaluate("x")).toEqual("Class(Object)")
                })
            })
        })

        it('invokes parent methods as self', () => {
            evaluate("class Crying{init(subject) { self.subject = subject }}")
            evaluate("class Creature {speak() { cry(self) }; cry(subj){Crying.new(subj)}}")
            evaluate("class Baby < Creature {}")
            expect(evaluate("Baby.new().speak()")).toEqual("Crying")
            expect(evaluate("Baby.new().speak().subject")).toEqual("Baby")
        })

        describe("super", () => {
            beforeEach(() => {
                evaluate("class Cries{init(subject) { self.subject = subject }}")
                evaluate("class Laughs{init(subject) { self.subject = subject }}")
                evaluate("class Words{}")
                evaluate("class Melody{}")
                evaluate("class Animal {speak() { cry(self) }; cry(subj){Cries.new(subj)}}")
                evaluate("class Person < Animal {speak(){Words.new()}}")
                evaluate("class Child < Person {speak(){super.super.speak()}}")
                evaluate("class Bird < Animal {speak(){Melody.new()}}")
                evaluate("class Flamingo < Bird { speak() {super.super.speak()}}")
            })
            it("is the super-instance", () => {
                expect(evaluate("Bird.new().speak()")).toEqual("Melody")
                expect(evaluate("Flamingo.new().speak()")).toEqual("Cries")
                expect(evaluate("Flamingo.new().speak().subject")).toEqual("Flamingo")
                expect(evaluate("Person.new().speak()")).toEqual("Words")
                expect(evaluate("Child.new().speak()")).toEqual("Cries")
                expect(evaluate("Child.new().speak().subject")).toEqual("Child")
            })
            it('unfolds and collapses', () => {
                expect(evaluate("super")).toEqual("Super(Main)")
                expect(evaluate("super.self")).toEqual("Main")
                expect(evaluate("super.class")).toEqual("Class(Object)")
                expect(evaluate("super.super")).toEqual("Super(Super(Main))")
                expect(evaluate("super.super.class")).toEqual("Class(Object)") // obj is own super...
                expect(evaluate("super.super.self")).toEqual("Main") // obj is own super...
            })
            describe("when called as a fn", () => {
                test.todo("is the current method's super-method")
            })
        })
    })

    describe('structures', () => {
        xdescribe('Boolean', () => {
            it('is the class of truth-values', () => {
                expect(evaluate('Boolean')).toEqual("Class(Boolean)")
            })
            it('is a class', () => {
                expect(evaluate('Boolean.class')).toEqual("Class(Class)")
            })
        })
        test.todo('Number')
        test.todo('Array')
        test.todo('String')
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
        it('has metaclass', () => {
            expect(evaluate("Main.meta")).toEqual("Class(Meta(Main))")
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