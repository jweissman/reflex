## syntax ideas

 -- it would be interesting to have
syntax for passing a function *as* a block (rather than an arg -- i guess ampersand could work here? i guess
this is how ruby thinks about it)

 -- tree notation (xml literal...)
 -- graph notation (grammar lit??)

 -- path and url literals

----------------------------------------------------------------
## types

- we have kept the core type system to the small core above to build a kind of shell that
  we can try to use to model the basic type system elements (i.e., a core language and testing harness
  with just the above tested in terms of themselves, without the added concerns of additional types/syntax)
- the extended type system should try to comprise at least the basics (with syntax support):
    * strings, numbers, booleans and lists
    * possibly: maps, tuples, ranges, nils/options, enums, symbols

- symbols looking increasingly important (for &:method calls e.g., but maybe there's a clearer way to express that??)

### modules and traits
- a module system is also in order; it would be interesting to consider a 'first-class traits'
  kind of system where entities can 'consciously' introspect not just on types, methods and attributes
  but also on traits/mixins and possibly other dimensions (?)
### mirrors
- a mirroring system for conjuring entities by strings, calling methods by strings
  -- mirror could also get you a binding of the environment, which might be needed to build yield-like structures?
  -- that kind of power seems sort of spooky but it might be the dark heart of the diamond
  -- huge crystal structure looms :)
- some kind of lens-like tech seems interesting here where functions are first-class citizens...
  (i.e. to create a 'detachable' attr_accessor... but idk -- nameLens = Mirror.lense(Model, :person, :name) is a lens from an object to the length of its name?)

  ----------------------------------------------------------------

## mirrors, bindings, holograms

i like the idea of a very general `Mirror` api with a handful of
utility functions -- i can imagine:

  - convoke, invoke a symbol as a bare function call
  - conjure, new up a class by the name of the class
  - reflect, simple reflect on the name of a class (give the class)
  - send, invoke a symbol as a method call on an object (maybe w/ options to bypass any userland interceptors...?)

a `Binding` set of utilites already seems extremely useful, but it would
be great to have that available for reflection somehow (i guess a thought would be
that too much reflection in the core is going to make things very slow, so
somehow try to avoid too much mirrored/binding-trickery code in the heart of the machine)

i keep thinking a hologram as a sort of set of lenses that project a virtual object
that you can interact with and pass around, but it's 'just' a structured set of references
around another object's attributes -- a hologram could be made readonly or writeonly, etc

(attr_accessors made their own machine -- a trait for modifiability?)

i'm imagining delegation as constructing an 'optical' set of layers around objects, and
indirecting as needed

a mock is a hologram, with certain methods replaced by local values

a formal idea of a hologram in the system seems interesting

maybe you need the mirror class to start projecting holograms

what does the syntax/api support look like?


```
hollow=Mirror.hologram(object)
hollow.name = 'John'
hollow.longComputation = () => { sleep 2 }
```

some assumptions: methods have to be mapped...
note the idea is that hollow can actually interact structurally with object
maybe it's readonly by default -- 

----------------------------------------------------------------

a totally different line of thinking but what if the distribution method is
baked into the system somehow -- i feel like i should be able to reference
code in a gist and go, even though that seems incredibly dangerous from other POVs
(maybe there's a WILD_SAUCE switch that unlocks possibly wiser-left-turned-down knobs)

----------------------------------------------------------------

----------------------------------------------------------------

## objects

okay, but seriously, how to expose object attributes

this does seem like a thing we can do without much else

and would help us understand method dispatch

it does seem like there needs to be a 'class execution context'
that additional stuff in the class def gets executed in

at least we need a chance to say 'all these things have such and such'

```
class Light {
  expose :lumens
}
```

that needs to run somewhere, and do some metamagic

what exactly does it do? it writes some methods to the instance methods of the class that
get and set lumens...

at the very least we should be able to call defineMethod there, even if the accessor helpers
are just wrappers around those


## Archetypes
A meta-trait, or hyperclass. Binds together traits and provides a classlike namespace.
So for data objects maybe the archetype is Structure, which we could give the name `struct`.
(Maybe Archetypes let you build new 'keyword-level' capabilities...)

i really like this idea (of archetypes letting you build new 'keyword-level' capabilities)...

[or 'closed classes' even?]

```
archetype struct {
  attribute(sym) { get_set(sym) }
}

struct Person {
  attribute :name
  attribute :age
  attribute :gender
}

Person # => Struct(Person)
```

jeez, this way maybe even lots of structures could be written in the language itself??
(we need language support for parsing but... i'm not even sure what exactly the thought
here really was -- but )

i guess you could still reopen structs but still, kind of interesting take...

i still think archetypes could code for something even more 'radical' than this, a hyperclass

but still, i guess the idea was to do an archetype for data operations

readonly seems more like a trait

```
trait reads { |attribute|
  self.defineMethod(attribute) { self.send(attribute) }
}
trait writes { |attribute|
  self.defineMethod("#@attribute=") { self.send(attribute + '=') }
}
trait exposes { |attribute|
  reads(attribute)
  writes(attribute)
}

class B { exposes :foo; reads :bar }
B.new().foo = "baz"
B.new().foo # "baz"
B.new().bar # nil
B.new().bar = "quuz" # meth missing "bar=" on B
```


----------------------------------------------------------------

okay, this weird define method thing

what i would LIKE is for some way to distinguish when we are calling 
defineMethod on a metaclass versus a 'normal' class

that way we can write the method name with a dot as in a class name

at this point the difference is cosmetic, behaviorally it's close to what
i want

but i think understanding why this is hard to distinguish is helpful

okay, so when we have situation like `class A{ meta.defineMethod('foo') {} }`
we get back a function `A#foo` which is nevertheless a class method on A
(i.e., not an instance method)

we would want to distinguish somehow in define method between the fact that
we got called on a metaclass

but it's too late?

or rather: meta's defineMethod instance is "also" class A's own instance method?
this is closer to the circle that's making this hard to reason about

okay, so MEMBERS of class A have instance methods, they live on A.instance_methods

instances of class A (like 'A', or more precisely 'Class(A)') ALSO have 
instance methods, like `new`, `defineMethod` etc

where do these live? on the metaclass of A -- `Class(Meta(A))`

Class(Meta(A)).instance_methods ARE Class(A)'s instance methods (i.e., class methods of A)
(they are even defined that way; at class construction time, Class A's class methods
are written to the instance methods of Class(Meta(A)) -- this is how defineClassMethod works,
the only difference is that being explicitly called it can differentiate trivially...)

okay, so what makes it hard to realize we're calling A.meta.defineMethod rather than A.defineClassMethod
(which to be clear is not in this case the alternative -- which makes this all obscure somehow??)

okay, so A and A.meta -- we want to define class methods on A, and we call A.meta.defineMethod('bar') {}
this ends up getting a method `A.defineMethod` (that is Class(A)'s define-instance method)

--------------------------------

just a terminological question that keeps bugging me

if X is the superclass of Y, X is Y's parent, Y is X's child, Y is X's "subclass"
so we have superclass/subclass as coordinate terms
what the's equivalent coordinate term of eigenclass or metaclass?
it's the "preclass" is the closest thing, but that sounds wild

can you even get to the preclass from the metaclass??
("protoclass" also seems like an option linguistically but something weird about it too)
'meta' and 'proto' have a nice symmetry

---

okay, just to state some facts that are now true about the object system

metaclasses hold the instance methods for classes

metaclasses of metaclasses hold instance methods for metaclasses

the metaclass of all meta-metaclasses is the class metaclass (also the 'root' super of all metametaclasses?)
(it basically stitches some holes in the type system but maybe with unexpected effects --
what does defining a class or an instance method on Metaclass itself do?
are those methods now instance methods of allllllllllllllllllll meta-metaclasses?!??
it's the hyperclass back again
is that true??
)

honestly the idea is that for practical purposes all the higher-order eigenclasses are really just
kind of notionaly -- it's interesting that mechanically we've needed at least one more order than i
would have thought (we apparently had to go to metametaclasses, inspiring some of this strange
wiring of Metaclass -- which again mucking about with is definitely encouraged if it would yield
interesting results but beware i suppose?)

---

