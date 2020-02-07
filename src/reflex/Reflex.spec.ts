import { evaluate, out } from "./SpecHelper"
describe('Reflex', () => {
    describe('structures', () => {
       describe("symbol", () => {
           it('is a class', () => {
               expect(evaluate("Symbol")).toEqual("Class(Symbol)")
           })

           it('new', () => {
               expect(evaluate("Symbol.new('hi')")).toEqual("hi")
           })

           it('lit', () => {
               expect(evaluate(":foo.class")).toEqual("Class(Symbol)")
           })

           it('call', () => {
               expect(evaluate("[0,1,2,3].map(&Symbol.new('zero')).collect()")).toEqual([true,false,false,false])
               expect(evaluate("[0,1,2,3].map(&Symbol.new('one')).collect()")).toEqual([false,true,false,false])
           })

           it("toString", () => {
               expect(evaluate(":foo.toString()")).toEqual("foo")
           })
           it('eq', () => {
               expect(evaluate(":alpha == :alpha")).toEqual(true)
               expect(evaluate(":alpha == :beta")).toEqual(false)
               expect(evaluate(":gamma == :gamma")).toEqual(true)
           })
           it("works as arg to send", () => {
               expect(evaluate("1.send :one")).toEqual(true)
               expect(evaluate("1.send :zero")).toEqual(false)
               expect(evaluate("0.send :zero")).toEqual(true)
           })
       }) 

       describe("hash", () => {
           it('tuple', () => {
               expect(evaluate("Tuple")).toEqual("Class(Tuple)")
               expect(evaluate("Tuple.new('a', 1).inspect()")).toEqual("a: 1")
               expect(evaluate("Tuple.new('a', 1).update { |k,v| v + 1 }")).toEqual("a: 2")
           })
           describe('dict', () => {
               it('is a class', () => {
                   expect(evaluate("Hash")).toEqual("Class(Hash)")
               })
               it('put', () => {
                   evaluate("h=Hash.new()")
                   expect(evaluate("h.inspect()")).toEqual("{}")
                   evaluate("h.put('a', 1)")
                   expect(evaluate("h.inspect()")).toEqual("{a: 1}")
               });
               it('update', () => {
                   evaluate("h=Hash.new()")
                   expect(evaluate("h.inspect()")).toEqual("{}")
                   evaluate("h.put('a', 1)")
                   expect(evaluate("h.inspect()")).toEqual("{a: 1}")
                   evaluate("h.update { |k,v| v+1 }")
                   expect(evaluate("h.inspect()")).toEqual("{a: 2}")
               });
               it('has/get', () => {
                   evaluate("h=Hash.new(); h.put('a', 2)")
                   expect(evaluate("h.has('a')")).toEqual(true)
                   expect(evaluate("h.get('a')")).toEqual(2)
                   expect(evaluate("h.has('b')")).toEqual(false)
                   expect(evaluate("h.get('b')")).toEqual(null)
               })

               it('eq', () => {
                   evaluate("h=Hash.new(); h.put('a', 2)")
                   evaluate("h2=Hash.new(); h2.put('a', 2)")
                   expect(evaluate("h.eq(h2)")).toEqual(true)
                   evaluate("h2.put('b', 3)")
                   expect(evaluate("h.eq(h2)")).toEqual(false)
               })

               it('shorthand', () => {
                   expect(evaluate("Hash.new() == {}"))
                   evaluate("h={a:1}")
                   expect(evaluate("h.class")).toEqual("Class(Hash)")
                   expect(evaluate("h.get('a')")).toEqual(1)
                   expect(evaluate("h[:a]")).toEqual(1)
               })
           })
       })
        test.todo("tree")
        test.todo("graph")
    })

    describe("syntax", () => {
        describe('core', () => {
            describe("calls", () => {
                it('multiple args passed in expected order', () => {
                    evaluate('s=(a,b)=>puts "a="+a+",b="+b')
                    evaluate("s 100, 250")
                    expect(out()).toEqual("a=100,b=250")
                })

                it('default args assigned nil', () => {
                    evaluate('fn=(a,b,c)=>puts "a="+a+",b="+b+",c="+c')
                    evaluate("fn 100, 250")
                    expect(out()).toEqual("a=100,b=250,c=null")
                })
            })
            describe('throws', () => {
                it('fails with error message', () => {
                    expect(()=>evaluate("fail 'hello'")).toThrowError("hello")
                })
            })
            describe("blocks", () => {
                it('simple blocks', () => {
                    evaluate('x=0')
                    evaluate('3.times { x = x + 1 }')
                    expect(evaluate('x')).toEqual(3)
                    evaluate('c=->x=x+1')
                    evaluate('three = 3.times') //(&b) { 3.times(&b) }')
                    evaluate('three &c')
                    expect(evaluate('x')).toEqual(6)
                    evaluate('d=b=>x=x+b')
                    evaluate('1.upto(3, &d)')
                    expect(evaluate('x')).toEqual(12)
                    evaluate('1.upto(3) { |i| x = x + i }')
                    expect(evaluate('x')).toEqual(18)
                })

                it('blocks in blocks', () => {
                    evaluate('x=0')
                    evaluate('upToEleven(&b) { 1.upto(11) { |i| b(i) }}')
                    evaluate('upToEleven { |v| x = x + v }')
                    expect(evaluate('x')).toEqual(66)
                    evaluate('d=b=>x=x+b')
                    evaluate('upToEleven(&d)')
                    expect(evaluate('x')).toEqual(132)
                })

                it('eachlike', () => {
                    evaluate('a=[1,2,3]')
                    evaluate(`eachlike(&eachBlock) {
                        0.upto(a.length() - 1) { |i| element = a.get(i); eachBlock(element) }
                    }`)
                    evaluate('x=0')
                    evaluate('eachlike { |i| x=x+i }')
                    expect(evaluate('x')).toEqual(6)
                })

                it('blocks with multiple args', () => {
                    evaluate('fn=(&b)=>b 1,2,3')
                    evaluate('say=(a,b,c)=>puts "a="+a+",b="+b+",c="+c')
                    evaluate('fn &say')
                    expect(out()).toEqual("a=1,b=2,c=3")
                })

                it('modifies locals', () => {
                    evaluate('x=Class')
                    evaluate('mod(){x=Object}')
                    expect(evaluate("x")).toEqual("Class(Class)")
                    evaluate('mod()')
                    expect(evaluate("x")).toEqual("Class(Object)")
                })

                xit('yields successive values', () => {
                    evaluate("gen(){yield Object; yield Class}")
                    evaluate("x=Function");
                    expect(evaluate("x")).toEqual("Class(Function)")
                    evaluate("gen(){|val|x=val}")
                    expect(evaluate("x")).toEqual("Class(Object)")
                    evaluate("gen(){|val|x=val}")
                    expect(evaluate("x")).toEqual("Class(Class)")
                })

                xit("funcalls with only blocks", () => {
                    evaluate("g(){yield Object; yield Class; yield Function}")
                    evaluate("x=Function")
                    evaluate("g{|val|x=val}")
                    expect(evaluate("x")).toEqual("Class(Object)")
                    evaluate("g{|val|x=val}")
                    expect(evaluate("x")).toEqual("Class(Class)")
                    evaluate("g{|val|x=val}")
                    expect(evaluate("x")).toEqual("Class(Function)")
                })

                xit('creates a generator factory', () => {
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

                xit("passes blocks to instance methods", () => {
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
                        expect(evaluate("x")).toEqual(null)
                        evaluate('g(&f)')
                        expect(evaluate("x")).toEqual("Class(Object)")
                    })

                    it('passes args through blocks', () => {
                        evaluate('x=0')
                        evaluate('c=->x=x+1')
                        evaluate('10.times { c() }')
                        expect(evaluate("x")).toEqual(10)
                        evaluate('10.times(&c)')
                        expect(evaluate("x")).toEqual(20)
                    })

                    it('passes args with blocks through blocks', () => {
                        evaluate('x=0')
                        evaluate('b=v=>x=x+v')
                        evaluate('0.upto(5) { |i| b(i) }')
                        expect(evaluate("x")).toEqual(15)
                        evaluate('0.upto(5, &b)')
                        expect(evaluate("x")).toEqual(30)
                    })
                })
            })
            describe('conditionals', () => {
                describe('gates execution', () => {
                    it('if-else', () => {
                        expect(evaluate("if (true) { Object } else { Class }")).toEqual("Class(Object)")
                        expect(evaluate("if (false) { Object } else { Class }")).toEqual("Class(Class)")
                        expect(evaluate("x=if (true) { Object } else { Class };x")).toEqual("Class(Object)")
                        expect(evaluate("x=if (false) { Object } else { Class };x")).toEqual("Class(Class)")
                        expect(evaluate("if true then { Object } else { Class }")).toEqual("Class(Object)")
                        expect(evaluate("if false then { Object } else { Class }")).toEqual("Class(Class)")
                        expect(evaluate("if true then Object else Class")).toEqual("Class(Object)")
                        expect(evaluate("if false then Object else Class")).toEqual("Class(Class)")
                    });

                    it('if', () => {
                        expect(evaluate("if (true) { Object }")).toEqual("Class(Object)")
                        expect(evaluate("if (false) { Object }")).toEqual(null)
                        expect(evaluate("x=if (true) { Object };x")).toEqual("Class(Object)")
                        expect(evaluate("x=if (false) { Object };x")).toEqual(null)
                    })

                    it('if dangles', () => {
                        expect(evaluate("Object if true")).toEqual("Class(Object)")
                        expect(evaluate("Object if false")).toEqual(null)
                        expect(evaluate("Object if true else Class")).toEqual("Class(Object)")
                        expect(evaluate("Object if false else Class")).toEqual("Class(Class)")
                    })

                    it('unless', () => {
                        expect(evaluate("unless (true) { Object } else { Class }")).toEqual("Class(Class)")
                        expect(evaluate("unless (false) { Object } else { Class }")).toEqual("Class(Object)")
                        expect(evaluate("unless (true) { Object }")).toEqual(null)
                        expect(evaluate("unless (false) { Object }")).toEqual("Class(Object)")

                        expect(evaluate("unless true==true then { Object } else { Class }")).toEqual("Class(Class)")
                        expect(evaluate("unless true==false then { Object } else { Class }")).toEqual("Class(Object)")
                        expect(evaluate("unless true==true then { Object }")).toEqual(null)
                        expect(evaluate("unless true==false then { Object }")).toEqual("Class(Object)")

                        expect(evaluate("unless true then Object else Class")).toEqual("Class(Class)")
                        expect(evaluate("unless false then Object else Class")).toEqual("Class(Object)")
                        expect(evaluate("unless true then Object")).toEqual(null)
                    })

                    it('unless dangles', () => {
                        expect(evaluate("Object unless true")).toEqual(null)
                        expect(evaluate("Object unless false")).toEqual("Class(Object)")
                        expect(evaluate("Object unless true else Class")).toEqual("Class(Class)")
                        expect(evaluate("Object unless false else Class")).toEqual("Class(Object)")
                    })

                    it('evaluates condition truthiness', () => {
                        expect(evaluate("Object unless 1")).toEqual(null)
                        expect(evaluate("Object if 1")).toEqual("Class(Object)")
                        expect(evaluate("Object unless 0")).toEqual("Class(Object)")
                        expect(evaluate("Object if 0")).toEqual(null)
                    })
                })

                describe('shorthand', () => {
                    it('ternary', () => {
                        expect(evaluate("true == false ? Object : Class")).toEqual("Class(Class)")
                        expect(evaluate("true == true ? Object : Class")).toEqual("Class(Object)")
                    })
                    describe('boolean or', () => {
                        it('has ORs truth table', () => {
                            expect(evaluate("true || true")).toEqual(true)
                            expect(evaluate("true || false")).toEqual(true)
                            expect(evaluate("false || true")).toEqual(true)
                            expect(evaluate("false || false")).toEqual(false)
                            expect(evaluate("false || false || true")).toEqual(true)
                        })
                        it('short-circuits', () => {
                            evaluate('x=nil')
                            evaluate('assign=->{x=Object.new();true}')
                            expect(evaluate("true || assign()")).toEqual(true)
                            expect(evaluate("x")).toEqual(null)
                            expect(evaluate("false || false || assign()")).toEqual(true)
                            expect(evaluate("x")).toEqual("Object")
                        })
                    })
                    describe('boolean and', () => {
                        it('has ANDs truth table', () => {
                            expect(evaluate("true && true")).toEqual(true)
                            expect(evaluate("true && true && false")).toEqual(false)
                            expect(evaluate("true && false")).toEqual(false)
                            expect(evaluate("false && true")).toEqual(false)
                            expect(evaluate("false && false")).toEqual(false)
                        })
                        it('short-circuits', () => {
                            evaluate('x=nil')
                            evaluate('assign=()=>{x=Object.new(); true}')
                            expect(evaluate("false && assign()")).toEqual(false)
                            expect(evaluate("x")).toEqual(null)
                            expect(evaluate("true && true && true && assign()")).toEqual(true)
                            expect(evaluate("x")).toEqual("Object")
                        })
                    })
                    describe('boolean not', () => {
                        it('has NOTs truth table', () => {
                            expect(evaluate("!true")).toEqual(false)
                            expect(evaluate("!false")).toEqual(true)
                        })

                        it('composes with boolean operators', () => {
                            expect(evaluate("!true || !false")).toEqual(true)
                            expect(evaluate("!false && !false")).toEqual(true)
                            expect(evaluate("!!true || !!false")).toEqual(true)
                        })
                    })
                })
            })

            describe('loops', () => {
                it('until', () => {
                    evaluate('x=8');
                    evaluate('y=1');
                    evaluate('until(x.zero()) { y = y * 2; x = x + (-1) }')
                    expect(evaluate('y')).toEqual(256);
                    expect(evaluate('x')).toEqual(0);
                })
                it('while', () => {
                    evaluate('x=8');
                    evaluate('y=1');
                    evaluate('while(x != 0) { y = y * 2; x = x + (-1) }')
                    expect(evaluate('y')).toEqual(256);
                    expect(evaluate('x')).toEqual(0);
                })

                it('times', () => {
                    evaluate("x=0")
                    evaluate("2.times { x = x + 1 }")
                    expect(evaluate("x")).toEqual(2)
                    evaluate("3.times { x = x * 2 }")
                    expect(evaluate("x")).toEqual(16)
                })
            })

            describe('operators', () => {
                describe('== (eq)', () => {
                    it('compares truth values', () => {
                        expect(evaluate("true == true")).toEqual(true)
                        expect(evaluate("true == false")).toEqual(false)
                        expect(evaluate("false == true")).toEqual(false)
                        expect(evaluate("false == false")).toEqual(true)
                    })
                    it('denotes absolute object equality', () => {
                        evaluate("o = Object.new()")
                        expect(evaluate("o == Object.new()")).toEqual(false)
                        expect(evaluate("Object.new() == Object.new()")).toEqual(false)
                        expect(evaluate("o == o")).toEqual(true)
                    })
                    it('denotes absolute class equality', () => {
                        expect(evaluate("Object == Object")).toEqual(true)
                        expect(evaluate("Object == Class")).toEqual(false)
                        expect(evaluate("Class == Class")).toEqual(true)
                    })
                    it('denotes absolute numeric equality', () => {
                        expect(evaluate("0 == 0")).toEqual(true)
                        expect(evaluate("0 == 1")).toEqual(false)
                        expect(evaluate("1 == 1")).toEqual(true)
                    })
                })

                describe("!= (neq)", () => {
                    it('distinguishes truth values', () => {
                        expect(evaluate("true != true")).toEqual(false)
                        expect(evaluate("true != false")).toEqual(true)
                        expect(evaluate("false != true")).toEqual(true)
                        expect(evaluate("false != false")).toEqual(false)
                    })
                    it('distinguishes objects absolutely', () => {
                        evaluate("o = Object.new()")
                        expect(evaluate("o != Object.new()")).toEqual(true)
                        expect(evaluate("Object.new() != Object.new()")).toEqual(true)
                        expect(evaluate("o != o")).toEqual(false)
                    })
                    it('distinguishes classes absolutely', () => {
                        expect(evaluate("Object != Number")).toEqual(true)
                        expect(evaluate("Object != Function")).toEqual(true)
                        expect(evaluate("Object != Object")).toEqual(false)
                        expect(evaluate("Class != Number")).toEqual(true)
                        expect(evaluate("Class != Boolean")).toEqual(true)
                        expect(evaluate("Class != Class")).toEqual(false)
                    })
                    it('distinguishes numbers absolutely', () => {
                        expect(evaluate("1 != 0")).toEqual(true)
                        expect(evaluate("0 != 0")).toEqual(false)
                        expect(evaluate("2 != -2")).toEqual(true)
                    })
                })

                describe("+-/*%", () => {
                    it('arithmetic', () => {
                        expect(evaluate('2+2')).toEqual(4)
                        expect(evaluate('2*3+5')).toEqual(11)
                        expect(evaluate('2*3+10/2')).toEqual(11)
                        expect(evaluate('3*(2+10)/2')).toEqual(18)
                        expect(evaluate('100%10')).toEqual(0)
                        expect(evaluate('101%10')).toEqual(1)
                        expect(evaluate('1101%10')).toEqual(1)
                    })
                    it('infinite arithmetic', () => {
                        expect(evaluate('1/0')).toEqual(Infinity)
                        expect(evaluate('-1/0')).toEqual(-Infinity)
                        expect(evaluate('(1/0)+1')).toEqual(Infinity)
                    })
                })

                describe("!", () => {
                    it('logical not', () => {
                        expect(evaluate("!true")).toEqual(false)
                        expect(evaluate("!false")).toEqual(true)
                    })
                    it('convolutes', () => {
                        expect(evaluate("!!true")).toEqual(true)
                        expect(evaluate("!!false")).toEqual(false)
                    })
                })

                describe('comparators', () => {
                    it('lt', () => {
                        expect(evaluate('1 < 0')).toEqual(false)
                        expect(evaluate('1 < 1')).toEqual(false)
                        expect(evaluate('1 < 2')).toEqual(true)
                    })
                    it('lte', () => {
                        expect(evaluate('1 <= 0')).toEqual(false)
                        expect(evaluate('1 <= 1')).toEqual(true)
                        expect(evaluate('1 <= 2')).toEqual(true)
                    })
                    it('gt', () => {
                        expect(evaluate('1 > 0')).toEqual(true)
                        expect(evaluate('1 > 1')).toEqual(false)
                        expect(evaluate('1 > 2')).toEqual(false)
                    })
                    it('gte', () => {
                        expect(evaluate('1 >= 0')).toEqual(true)
                        expect(evaluate('1 >= 1')).toEqual(true)
                        expect(evaluate('1 >= 2')).toEqual(false)
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
                expect(evaluate("parent=klass=>klass.super")).toMatch("(klass) => klass.super")
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

            it("dot access never falls back", () => {
                evaluate("class Ladder { climb() { Class }}")
                evaluate("fall=Object")
                expect(evaluate("Ladder.new().climb()")).toEqual("Class(Class)")
                expect(() => evaluate("Ladder.new().fall")).toThrow()
            })
        })

        describe('destructuring', () => {
            beforeEach(() => evaluate('cons=...as=>as'))
            it('destructures positional params', () => {
                expect(evaluate('cons 1,2,3')).toEqual([1,2,3])
            })
            it('destructures args and params', () => {
                expect(evaluate('cons ...[1,2,3]')).toEqual([1,2,3])
                expect(evaluate('cons 1,2,...[3,4,5],6,7,...[8,9,10]')).toEqual([1,2,3,4,5,6,7,8,9,10])
            })
        })
    })

    describe('message dispatch', () => {
        describe('#onMethodMissing', () => {
            xit('is invoked when a method is missing', () => {
                evaluate("class Foo { onMethodMissing(sym) { true if sym == 'ok' else false }}")
                evaluate("foo = Foo.new()")
                expect(evaluate("foo.ok()")).toEqual(true)
                expect(evaluate("foo.nope()")).toEqual(false)
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

        it('successor and predecessor', () => {
            evaluate("x = 0")
            expect(evaluate("x = x + 1")).toEqual(1)
            expect(evaluate("x = x - 1")).toEqual(0)
            expect(evaluate("x = x - 1")).toEqual(-1)
        })

        it('upto', () => {
            evaluate('x=0')
            evaluate('1.upto(10) { |n| x = x + n }')
            expect(evaluate('x')).toEqual(55)
        })
    })

    it('can escape a newline', () => {
        expect(evaluate(`
        x=1
        z=(x+\\
        1).zero
        z()
        `)).toEqual(false)
    })
    it('delimits statements reasonably', () => {
        expect(evaluate(`
        x=0
        z=x.zero
        z()
        `)).toEqual(true)
    })

    it('delimits statements reasonably (ii)', () => {
        expect(evaluate(`
        x=10
        y=3.times
        y { x = x + 1 }
        x
        `)).toEqual(13)
    })

    it('archetype with simple class name', () => {
        evaluate('class Model {}')
        expect(evaluate('Model')).toEqual('Class(Model)')
        evaluate('model Car {}')
        expect(evaluate('Car.new()')).toEqual('Car')
        expect(evaluate('Car.super')).toEqual('Class(Model)')
        evaluate('model Taxi < Car {}')
        expect(evaluate('Taxi.new()')).toEqual('Taxi')
        expect(evaluate('Taxi.super')).toEqual('Class(Car)')
    })

    test.todo("archetype with ComplexClassName")
    test.todo("sum/union archetype")

    it('will not carefully call higher-order funs', () => {
        evaluate('g=->->3')
        expect(() => evaluate('g()()')).toThrow()
    })

    xit('does not casually call numeric literals', () => {
        expect(() => evaluate('1 2 3')).toThrow()
    })

    it('orders operations with variables', () => {
        evaluate('x=0')
        expect(evaluate('2*x-3')).toEqual(-3)
    })

    it('(unused?) vars in funcall do not trash the stack (?)', () => {
        evaluate('f=->{a=0;b=1;c=4;2}')
        expect(evaluate('f()')).toEqual(2)
        expect(evaluate('f()+2')).toEqual(4)
        expect(evaluate('f()/2')).toEqual(1)
        expect(evaluate('2+2*2')).toEqual(6)
        expect(evaluate('f()+f()*2')).toEqual(6)
    })

    it('fib', () => {
        evaluate('fib=n=>(n.zero()||n.one())?1:fib(n-1)+fib(n-2)')
        expect(evaluate('fib 0')).toEqual(1)
        expect(evaluate('fib 1')).toEqual(1)
        expect(evaluate('fib 2')).toEqual(2)
        expect(evaluate('fib 3')).toEqual(3)
        expect(evaluate('fib 4')).toEqual(5)
        expect(evaluate('fib 5')).toEqual(8)
    })

    it('fib example', () => {
        evaluate('require "examples/fib"')
        evaluate('fibonacci=Fibonacci.new()')
        expect(evaluate('fibonacci 0')).toEqual(1)
        expect(evaluate('fibonacci 1')).toEqual(1)
        expect(evaluate('fibonacci 2')).toEqual(2)
        expect(evaluate('fibonacci 3')).toEqual(3)
        expect(evaluate('fibonacci 4')).toEqual(5)
        expect(evaluate('fibonacci 5')).toEqual(8)
        expect(evaluate('fibonacci 6')).toEqual(13)
        expect(evaluate('fibonacci 7')).toEqual(21)
        expect(evaluate('fibonacci 8')).toEqual(34)
        expect(evaluate('fibonacci 9')).toEqual(55)
        expect(evaluate('fibonacci 60')).toEqual(2504730781961)
        expect(evaluate('fibonacci 70')).toEqual(308061521170129)
    })

    it('prints', () => {
        expect(evaluate("puts 'hello world'")).toEqual(null)
        expect(out()).toEqual("hello world")
    })

    it('hello world', () => {
        evaluate("using 'examples/hello'")
        expect(evaluate("Greeter.new().greet('world')")).toEqual("Hello, world")
    })

    it('paints', () => {
        evaluate("using 'paint'; paint=Paint.new()")
        expect(evaluate("puts paint.yellow('hi there!')")).toEqual(null)
        expect(out()).toEqual("\u001b[33mhi there!\u001b[0m")
        expect(evaluate("puts paint.red('town')")).toEqual(null)
        expect(out()).toEqual("\u001b[31mtown\u001b[0m")
    })

    it('poetry', () => {
        expect(()=>evaluate("using 'examples/poem'")).not.toThrow()
    })

    xit('self-spec', () => {
        expect(() => evaluate("Kernel.import 'spec'")).not.toThrow()
        expect(() => evaluate(`
        describe('reflex') {
            it('is great') {
                true.should be true
                false.should be false
            }
        }`)).not.toThrow()
    })
})