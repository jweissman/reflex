import { evaluate } from "./SpecHelper"
describe('Reflex', () => {
    describe('structures', () => {
        describe('Boolean', () => {
            it('is the class of truth-values', () => {
                expect(evaluate('Boolean')).toEqual("Class(Boolean)")
            })
            it('is a class', () => {
                expect(evaluate('Boolean.class')).toEqual("Class(Class)")
            })
            describe('Truth', () => {
                it('descends from boolean', () => expect(evaluate('Truth.isDescendantOf(Boolean)')).toEqual('Truth'))
            })
            describe('Falsity', () => {
                it('descends from boolean', () => expect(evaluate('Falsity.isDescendantOf(Boolean)')).toEqual('Truth'))
            })
            describe('true', () => {
                it('is a Boolean', () => {
                    expect(evaluate("true.class")).toEqual("Class(Truth)")
                    expect(evaluate("true.class.super")).toEqual("Class(Boolean)")
                })
                it('has a positive truth-value', () => {
                    expect(evaluate("true.true()")).toEqual("Truth")
                    expect(evaluate("true.false()")).toEqual("Falsity")
                })
                it('eq itself', () => {
                    expect(evaluate("true.eq(true)")).toEqual("Truth")
                    expect(evaluate("true.eq(false)")).toEqual("Falsity")
                })
                it('neq false', () => {
                    expect(evaluate("true.neq(true)")).toEqual("Falsity")
                    expect(evaluate("true.neq(false)")).toEqual("Truth")
                })
            })
            describe('false', () => {
                it('is a Boolean', () => {
                    expect(evaluate("false.class")).toEqual("Class(Falsity)")
                    expect(evaluate("false.class.super")).toEqual("Class(Boolean)")
                })
                it('has a negative truth-value', () => {
                    expect(evaluate("false.true()")).toEqual("Falsity")
                    expect(evaluate("false.false()")).toEqual("Truth")
                })
                it('eq itself', () => {
                    expect(evaluate("false.eq(false)")).toEqual("Truth")
                    expect(evaluate("false.eq(true)")).toEqual("Falsity")
                })
                it('neq true', () => {
                    expect(evaluate("false.neq(true)")).toEqual("Truth")
                    expect(evaluate("false.neq(false)")).toEqual("Falsity")
                })
            })
        })
        test.todo('Number')
        test.todo('Array')
        test.todo('String')
    })

    describe("syntax", () => {
        describe('core', () => {
            describe('conditionals', () => {
                describe('gates execution', () => {
                    it('if-else', ()=> {
                        expect(evaluate("if (true) { Object } else { Class }")).toEqual("Class(Object)")
                        expect(evaluate("if (false) { Object } else { Class }")).toEqual("Class(Class)")
                    });

                    xit('if', ()=> {
                        expect(evaluate("if (true) { Object }")).toEqual("Class(Object)")
                        expect(evaluate("if (false) { Object }")).toEqual("Nihil")
                    })

                    xit('if dangles', () => {
                        expect(evaluate("Object if true")).toEqual("Class(Object)")
                        expect(evaluate("Object if false")).toEqual("Nihil")
                        expect(evaluate("Object if true else Class")).toEqual("Class(Object)")
                        expect(evaluate("Object if false else Class")).toEqual("Class(Class)")
                    })

                    it('unless', ()=> {
                        expect(evaluate("unless (true) { Object } else { Class }")).toEqual("Class(Class)")
                        expect(evaluate("unless (false) { Object } else { Class }")).toEqual("Class(Object)")
                        // expect(evaluate("unless (true) { Object }")).toEqual("Nihil")
                        // expect(evaluate("unless (false) { Object }")).toEqual("Class(Object)")

                        // expect(evaluate("unless true { Object } else { Class }")).toEqual("Class(Class)")
                        // expect(evaluate("unless false { Object } else { Class }")).toEqual("Class(Object)")
                        // expect(evaluate("unless true { Object }")).toEqual("Nihil")
                        // expect(evaluate("unless false { Object }")).toEqual("Class(Object)")

                        // expect(evaluate("unless true Object else Class")).toEqual("Class(Class)")
                        // expect(evaluate("unless false Object else Class")).toEqual("Class(Object)")
                        // expect(evaluate("unless true Object")).toEqual("Nihil")
                    })

                    xit('unless dangles', () => {
                        expect(evaluate("Object unless true")).toEqual("Nihil")
                        expect(evaluate("Object unless false")).toEqual("Object(Class)")
                        expect(evaluate("Object unless true else Class")).toEqual("Class(Class)")
                        expect(evaluate("Object unless false else Class")).toEqual("Class(Object)")
                    })
                })
            })
            describe('operators', () => {
                describe('== (eq)', () => {
                    it('compares truth values', () => {
                        expect(evaluate("true == true")).toEqual('Truth')
                        expect(evaluate("true == false")).toEqual('Falsity')
                        expect(evaluate("false == true")).toEqual('Falsity')
                        expect(evaluate("false == false")).toEqual('Truth')
                    })
                    it('denotes absolute object equality', () => {
                        evaluate("o = Object.new()")
                        expect(evaluate("o == Object.new()")).toEqual('Falsity')
                        expect(evaluate("Object.new() == Object.new()")).toEqual('Falsity')
                        expect(evaluate("o == o")).toEqual('Truth')
                    })
                    it('denotes absolute class equality', () => {
                        expect(evaluate("Object == Object")).toEqual('Truth')
                        expect(evaluate("Object == Class")).toEqual('Falsity')
                        expect(evaluate("Class == Class")).toEqual('Truth')
                    })
                })

                describe("!= (neq)", () => {
                    it('distinguishes truth values', () => {
                        expect(evaluate("true != true")).toEqual('Falsity')
                        expect(evaluate("true != false")).toEqual('Truth')
                        expect(evaluate("false != true")).toEqual('Truth')
                        expect(evaluate("false != false")).toEqual('Falsity')
                    })
                    xit('distinguishes objects absolutely', () => {
                        evaluate("o = Object.new()")
                        expect(evaluate("o != Object.new()")).toEqual('Truth')
                        expect(evaluate("Object.new() != Object.new()")).toEqual('Truth')
                        expect(evaluate("o != o")).toEqual('Falsity')
                    })
                    xit('distinguishes classes absolutely', () => {
                        expect(evaluate("Object != Object")).toEqual('Truth')
                        expect(evaluate("Object != Class")).toEqual('Falsity')
                        expect(evaluate("Class != Class")).toEqual('Truth')
                    })
                })
            })
        })

        describe('sugar', () => {
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

            it('barewords fall back to self', () => {
                evaluate("class Bar{baz(){self.there=Class; there}}")
                expect(evaluate("Bar.new().baz()")).toEqual("Class(Class)")
            })

            // was just a sanity check, can probably remove this
            it("dot access never falls back", () => {
                evaluate("class Ladder { climb() { Class }}")
                evaluate("fall=Object")
                expect(evaluate("Ladder.new().climb()")).toEqual("Class(Class)")
                expect(() => evaluate("Ladder.new().fall")).toThrow()
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

            // hrmm
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


    })


    describe('main', () => {
        it('is an object', () => {
            expect(evaluate("self")).toEqual("Main")
        })
        it('has class', () => {
            expect(evaluate("class")).toEqual("Class(Main)")
        })
        it('has eigenobj', () => {
            expect(evaluate("meta")).toEqual("Class(Meta(Main instance))")
        })
        it('has super facade', () => {
            expect(evaluate("super")).toEqual("Super(Main)")
            expect(evaluate("super.class")).toEqual("Class(Object)")
        })


        describe('Main', () => {
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
            expect(() => evaluate("self.o")).toThrow()
        })
    })
})