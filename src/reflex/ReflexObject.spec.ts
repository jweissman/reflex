import { evaluate } from "./SpecHelper";

describe('Object', () => {
    it('is a class', () => {
        expect(evaluate("Object.class")).toEqual("Class(Class)")
    });
    it('is the class of Objects', () => {
        expect(evaluate("Object")).toEqual("Class(Object)")
    });
    it('is its own supertype', () => {
        expect(evaluate("Object.super")).toEqual("Class(Object)")
    })
    
    describe(".new", () => {
        it('is a Function', () => {
            expect(evaluate("Object.new")).toEqual("Function(Object.new[wrap])")
        })
        it('constructs new Object', () => {
            expect(evaluate("Object.new()")).toEqual("Object")
        })
        it('constructed Objects have Object as class', () => {
            expect(evaluate("Object.new().class")).toEqual("Class(Object)")
        })
        it('constructed objects have a class that is a class', () => {
            expect(evaluate("Object.new().class.class")).toEqual("Class(Class)")
        })
    });

    describe('#methods()', () => {
        test.todo("once we have lists and strings/symbols...")
    })

    describe("members", () => {
        it('direct write access is disallowed outside self', () => {
            evaluate("o=Object.new()")
            expect(()=>evaluate("o.x=Function")).toThrow()
        })

        test.todo("direct read access is disallowed outside self")
    })

    describe("super", () => {
        it('is the super facade (invokes parent methods as self)', () => {
            evaluate("class Crying{init(subject) { self.subject = subject }}")
            evaluate("class Creature {speak() { cry(self) }; cry(subj){Crying.new(subj)}}")
            evaluate("class Baby < Creature {}")
            expect(evaluate("Baby.new().speak()")).toEqual("Crying")
            expect(evaluate("Baby.new().speak().subject")).toEqual("Baby")
        })

        describe("semantics", () => {
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

    describe("meta", () => {
        it('is the eigenobject', () => {
            evaluate("o=Object.new()")
            evaluate("o.meta.defineMethod('bar') { Function }")
            expect(evaluate("o.bar()")).toEqual("Class(Function)")
            expect(() => evaluate("Object.new().bar()")).toThrow()
        })
    })

    describe("#instanceEval", () => {
        it('evaluates a block as self', () => {
            evaluate("o=Object.new()")
            expect(evaluate("o.instanceEval { self }")).toEqual("Object")
            expect(evaluate("o.instanceEval { self.x = Function }; o.x")).toEqual("Class(Function)")
        })

        // again just a sanity check, could be pruned
        it('does not trash frame self', () => {
            evaluate("o=Object.new()")
            expect(evaluate("self")).toEqual("Main")
            expect(evaluate("o.instanceEval { self }")).toEqual("Object")
            expect(evaluate("self")).toEqual("Main")
            expect(evaluate("o.instanceEval { self.x = Function }; o.x")).toEqual("Class(Function)")
            expect(evaluate("self")).toEqual("Main")
        })
    })

    describe("#isInstanceOf", () => {
        it('knows its ancestors', () => {
            evaluate("o=Object.new()")
            expect(evaluate("o.isInstanceOf(Object)")).toEqual(true)
        })
    })
});