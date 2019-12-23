import Reflex from "./Reflex"

// const evaluate = (reflex)

describe(Reflex, () => {
    let reflex: Reflex = new Reflex()
    // afterEach(() => expect(reflex.machine.stack.length).toEqual(0))
    describe('Object', () => {
        it('is a class', () => {
            expect(reflex.evaluate("Object.class").toString()).toEqual("Class(Class)")
        });
        it('is the class of Objects', () => {
            expect(reflex.evaluate("Object").toString()).toEqual("Class(Object)")
        });
        it('is its own supertype', () => {
            expect(reflex.evaluate("Object.super").toString()).toEqual("Class(Object)")
        })
        describe(".new", () => {
            it('is a Function', () => {
                expect(reflex.evaluate("Object.new").toString()).toEqual("Function(Object.new[wrap])")
            })
            it('constructs new Object', () => {
                expect(reflex.evaluate("Object.new()").toString()).toEqual("Object")
            })
            it('constructed Objects have Object as class', () => {
                expect(reflex.evaluate("Object.new().class").toString()).toEqual("Class(Object)")
            })
            it('constructed objects have a class that is a class', () => {
                expect(reflex.evaluate("Object.new().class.class").toString()).toEqual("Class(Class)")
            })
        });
        describe('member attrs', () => {
            xit('open for assignment', () => {
                reflex.evaluate("o=Object.new()")
                expect(reflex.evaluate("o.x=Function")).toEqual('Class(Function)')
                expect(reflex.evaluate("o.x")).toEqual('Class(Function)')
            })
            // reflex.eva
        })
    });
    describe('Class', () => {
        it('is the class of Classes', () => {
            expect(reflex.evaluate("Class").toString()).toEqual("Class(Class)")
        })
        it('is a class', () => {
            expect(reflex.evaluate("Class.class").toString()).toEqual("Class(Class)")
        })
        it('has object as supertype', () => {
            expect(reflex.evaluate("Class.super").toString()).toEqual("Class(Object)")
        })
        describe(".build", () => {
            it('is a Function', () => {
                expect(reflex.evaluate("Class.build").toString()).toEqual("Function(Class.build[wrap])")
                // expect(reflex.evaluate("Class.build").toString()).toEqual("Function(Object.build)")
            })

            it('is a class factory', () => {
                expect(reflex.evaluate("Class.build()").toString()).toEqual("Class(Anonymous)")
            });

            it('new classes are classes', () => {
                expect(reflex.evaluate("Class.build().class").toString()).toEqual("Class(Class)")
            })

            it('new classes are subclasses of Class', () => {
                expect(reflex.evaluate("Class.build().super").toString()).toEqual("Class(Class)")
            })

            describe('instance methods', () => {
                xit('defines an instance method', () => {
                    expect(reflex.evaluate("Class.build().defineMethod('foo', (x) => x + 1})").toString()).toEqual("Function(Anonymous.foo)")
                })
            })

            describe('subclassing', () => {
                it('builds a class by name', () => {
                    expect(reflex.evaluate("Class.build('Bar')").toString()).toEqual("Class(Bar)")
                });
                it('constructs a built class', () => {
                    expect(reflex.evaluate("Class.build('Bar').new()").toString()).toEqual("Bar")
                });
                it('builds a subclass', () => {
                    expect(reflex.evaluate("Class.build('Bar').build('Baz')").toString()).toEqual("Class(Baz)")
                    expect(reflex.evaluate("Class.build('Bar').build('Baz').new()").toString()).toEqual("Baz")
                    expect(reflex.evaluate("Class.build('Bar').build('Baz').new().class").toString()).toEqual("Class(Baz)")
                    expect(reflex.evaluate("Class.build('Bar').build('Baz').new().class.super").toString()).toEqual("Class(Bar)")
                });
                // it('shares between instances')
                // expect(reflex.evaluate("Class.build('Baz').new()").toString()).toEqual("Baz")
            })
        })
    });
    describe('Function', () => {
        it('is the class of Functions', () => {
            expect(reflex.evaluate("Function").toString()).toEqual("Class(Function)")
        })
        it('is a class', () => {
            expect(reflex.evaluate("Function.class").toString()).toEqual("Class(Class)")
        })
        it('has object as supertype', () => {
            expect(reflex.evaluate("Function.super").toString()).toEqual("Class(Object)")
        })
        it('creates functions', () => {
            expect(reflex.evaluate("foo() { Object }").toString()).toMatch(/Function\(foo@lambda-\d+\)/)
        });
        it('invokes functions', () => {
            expect(reflex.evaluate("foo() { Object }").toString()).toMatch(/Function\(foo@lambda-\d+\)/)
            // expect(reflex.evaluate("foo").toString()).toEqual("Function(foo)")
            expect(reflex.evaluate("foo()").toString()).toEqual("Class(Object)")
            // expect(reflex.evaluate("foo().class").toString()).toEqual("Class(Class)")
        })
    })
    describe('main', () => {
        it('inspects main object', () => {
            expect(reflex.evaluate("self").toString()).toEqual("Main")
        })
        it('inspects main class', () => {
            expect(reflex.evaluate("Main").toString()).toEqual("Class(Main)")
        })
        it('main class is a class', () => {
            expect(reflex.evaluate("Main.class").toString()).toEqual("Class(Class)")
        })
        it('main is an object', () => {
            expect(reflex.evaluate("Main.super").toString()).toEqual("Class(Object)")
        })
        it('variables', () => {
            reflex.evaluate("a = Object")
            expect(reflex.evaluate("a").toString()).toEqual("Class(Object)")
            expect(reflex.evaluate("a.class").toString()).toEqual("Class(Class)")
        })
        
        //test.todo('construct new instance of new class')
        //test.todo('define new class more eloquently')
        //test.todo('construct new instance of new class')
        //test.todo('invoke parent methods')
        //test.todo('construct new function')
        //test.todo('construct new higher-order function')
    })
})