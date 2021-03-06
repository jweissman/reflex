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

what if graph lit is 'just' an ohm literal??
(another route to meta-circ but maybe just helpful for dsls?)
could they be dynamic *extensions* to the grammar??
what would the reflex object look like to parse things??
we'd need to fully reify the ast -- all this seems for later
simple parsers though should be straightforward (~hand wave~)
thinking of it as a possible route to language extension is interesting though
beyond archetypes, 'concepts'?? custom little mixin dsls
(speaks to the 'safe meta' kind of point....)
would be interesting to have the xml extensions modelled this way...
the question is like: what can you factor out?
not for optimization necessarily but...
conflicts/ambiguities between alien grammars, how do you sort that out?
hopefully they just meld?
(will have to try some things!!)

---
structural pattern matching -- ellipsis in xml?

---------

- would be interesting to have class literal notation be archetype
- would be useful for implementing iterators to have notation
  that captures a parameter as ast -- or wraps as a function that calls the expression
  -- i can imagine notation on the calling-side that indicates this, but not sure
  about the other way (some way the function notation can indicate 'this arg is an ast/should be converted to block')
  -- mostly b/c by the time we get around to assigning the arg to the parameter it's already been resolved
     so there has to be something that knows on the call side about it and prepares it, but...
  -- it's almost like a macro, could we do a preprocessor?
  -- basically needs to be done in assembler
  -- should there be a slightly higher-order lang in between?
  -- ```.while -- (test,work) {
    .loop:
    ...test
    jump_if_false done
    call work
    jump loop
    .done:
    ret```
  --}
  -- i guess this really speaks to why it's simpler to build the loop
     primitive into the language???
  -- we can implement any higher order things we need with yield etc i think
  -- okay, so there at least this one or two looping primitives -- while/until
  -- it would be nice to be able to parse the asm-like language

---

okay, so does our meta map match up :)

if so, then super! and maybe filling in nil / glancing at bool

--


okay, so maybe mirror api

Mirror
  conjure(klassName) -- instantiate class by name
  bind -- give a binding
  reflect(obj) -- create object image (instance of class of images of this class, Image(Klass))

Binding
  dispatch -- send message call
  local vars
  yield? / flow ctrl?
  inspect/manip frames, stack?
  modify code? exec raw instructions?

Image  -- by default a simple delegating proxy...
  filter/intercept -- 'fix' messages in flight, redirect
  imbue -- construct a 'real' object with attributes set from the pov of this image
  project(obj) -- create a Hologram of the underlying object
  compose(obj) -- ...add to stack of image elements??

(Is the idea you can treat images 'like' an object? You could extend them like a view but...)

Hologram -- transparent proxy ('thinks' it is the object? -- 'pass through' mirror?)
  solidify -- construct a 'real' object with attributes set from the pov of this hologram?
            -- is the image 'bound' permanently??

-- are messages objects, like in smalltalk? seems like a LOT

-- could we do mixins/traits with mirror things??
-- maybe even modules? (maybe mixins are JUST modules)
-- archetype keyword stuff could add more sugar but 


-- okay, so images are like proxies, wrappers around objects that define various ways of manipulating
   messages -- maybe one thing to consider would be attribute handling, this is where we could make images
   not try to set attributes on the underlying object...
-- and holograms are images that 'hide'/obscure the fact they are images, maybe useful for test doubles??

   maybe images/holograms could be 'wired' back to their objects so that setting attributes on them
   actually modifies the underlying object -- otherwise maybe by default they just set 'local' attributes
   on the projection

   -- the idea is that when we call a method on an image, we are calling methods on the underlying class,
     but from the perspective of the image,

-- (super facade could be a mirror image/hologram?? i guess it would need to be a hologram)

// archetype Archetype {}

self.defineArchetype('class') { |name, superclass, block|
  klass = Class.new(name, superclass)
  klass.defineMethod(:_setup,&block)
  klass._setup()
  klass
}

class Bar {...}

-----

okay, both main and super facade have image/hologram-like functionality they need
to wit --
main needs to define a defineMethod that's "equivalent" to its metaclasses defineMethod
(so that methods that main itself defines are accessible as instance methods on main...)

super needs to route messages in a weird way, via the facade, which is already kind of image-esque

again it just feels like it would be nice to give people some 'optical' construction kits
for managing message dispatch in interesting/useful ways.

and we already have a couple cases that seem like they'd be simplified by it!

---

maybe for barrier to javascript we need something more intense than simple mirror -- 
a Portal that generates appropriate
mirror-like structures -- maybe better called 'Wormholes' if they are reflecting around JS objects?
maybe Wormhole is like the channel you use, that the portal can give, into the JS context -- ??

---

realm -- reflex elm dsl

--- this is more like the react dsl?

```
AppLayout = FC <div><main>{yield}</main></div>
state AppState { count = 0; inc() { count++ } }
component App {
  stateful AppState
  render(state) {
    <AppLayout>
      <div><button onClick=#:Increment>
    </AppLayout>
  }
}
```

elmish would be like

```
archetype Message {}
message Increment {}
message Decrement {}
model = 0
view(model) {
  <div>
    <button onClick=#:Increment>+</button>
    <button onClick=#:Decrement>-</button>
  </div>
}
update(msg, model) {
  case message as Message {
    when Increment then model++
    when Decrement then model--
  }
}
app = modelViewUpdate model, view, update
```

---

thinking of ! and ? as suffixes -- ! could call niladic functions 'forcefully' (maybe gathering yields into a list?? hard collect?)
? could cast to truthy whatever the result of the function is -- maybe also short-circuit/safenav (is that too much on one symbol??)
these are just options, it's kind of interesting that they still don't necessarily need to call the function
(these could be implemented as higher order fns...)

----


a few quick models for reflex as a general project...

  - "adding reflection to javascript"
  - 'unitary ruby' (reflection across client/server barrier... drb++)
  - 'infinite lisp' (binding+bytecode introspection and ast structure manip as xml trees both seem v powerful honestly --)

---

keep having this thought about going metacircular, having a grammar literal that is just an ohm grammar
(or being able to 'natively' import an ohm grammar) and then using that to parse things, into structures
you could give with xml literals

and then the language itself could be encoded into itself??

this at least in theory permits some degree of metacircular structure, but it's a bit convoluted

it does seem nice for lang *extensions* to be able to specify simultaneously the grammatical part and the tree details

being able to specify parts of the language 'in refl' seems neat / opening up a powerful set of properties

again this is probably all lang-astronaut stuff but it also seems like the critical path is interesting anyway --

tree objects (syntaxed as xml literals) as parse targets, and grammar literals (ohm heredocs) for parsing little languages

---


shadow -- an image that returns nil for everything?? (could be basis for pure mocks)
void -- an image that throws for everything?


trying to think about the semantics for mocking
we want the mirror to be able to create a spy, something that can report
that it received a message, even though it does nothing with it
-- it could start with a shadow (or void if you want to be 'strict'??)
   and then add spy instrumentation around methodMissing

---


it just kidn of struck me --
reflex DOEs imply some kind of structured pattern matching
could we do some kind of substructural typing with archetypes
(not just exhaustion checking on cases but pattern matching tuples or something??)
let people have a little type algebra, as a treat
what does it mean, though, and how do those kind of forms interact with other things?

at some level maybe it's just destructuring, which i can see how to do with lists and hashes
(and maybe sets etc)

trees are more obscure

in particular strings are interesting since we could 'destructure' over a grammar, yielding
a tree whose elements can be matched against structurally

pattern-action is the reflex mechanism, and it is not known in nature for 'discrimination'
something happening beneath the level of consciousness -- beneath the abstract language/system your
living body gives you to manipulate it with, the internal system of icons and metaphors linked to feelings
and actions and operations -- almost all of animal awareness is 'reflex oriented' in a certain way

patterns -- actions

how to manipulate structures in order to extract these?

i keep thinking of path primitives, and 'micro-lenses' of some kind that can be composed into new
amalgam objects -- crystalline structures bridging the (abstraction, language, higher-order kinds?) 

----------------------------------------------------------------

how to destructure an object is kind of an interesting question, maybe THE question
we can ask an object in a case/match kind of structure whether it matches a given structure
then it's up to objects to answer them -- maybe archetypes (and unions/sums/algebraic results of composing
and decomposing archetypes) can construct pretty complex matching systems without too much elbow grease/boilerplate

---

we sure are leaning hard on archetypes, let's just recall the most basic thing we can do with them.

it might be time to see if our language can start handling it.

the simplest function of the archetype is to provide a subclassing mechanism that has a tiny bit
more sugar: instead of say `class Zebra < Animal {}`, given we know we have a lot of `Animal`s in the system suppose, we can create a foo archetype... and then we can say `animal Zebra {}`

this is the simplest possible sugar we can imagine, and it really boils down to defining a wrapper
with the name around Class new...

jeez, can we do this just with what we have now??

i'm imagining something like `animal = Animal.archetype`

which raises the question of what that `archetype` function is/does but i think we might be
able to work it out

at least it would be interesting to know what's MISSING from that, since there's no sugar (grammar)
involved

okay, so when we are asked to create an archetype for an `Animal` -- `Class(Animal)`, we want to
yield a function that creates new instances of class animal... and accepts a block that it runs
as setup

```
class Class {
  meta.instanceEval {
    archetype() {
      (^name,&b) => Class.new(name)
    }
  }
}
```

okay, that's where it comes down to needing lang support or macro system or something

let's think through the lang support side then, we'd need to test for
an 'archetypal' definition as being distinct from a normal function call

we could have archetypes on by default, but that could possibly get confusing??
i kind of like the idea though




------------

alright, so i think the model is something like conceptually 

objects are always 'partial objects' on a continuum between pure 'values' and formal types

the entire idea (oo) is to build structure/function up gradually, using abstraction layers to simplify
implementaiton, allow reuse, and more importantly, permit a cognitively-tractable degree of structural granularity (a small number of fine details that govern most important structures/patterns)

so there's a pure ('purity') continuum of objects

    <----------------------------------------------------------->
    more abstract                                    more concrete       
    Object     Animal         Canine         Shepherd         Fido

                                                      'final' (inextensible classes)
                              archetypes

so archetypes are one way to capture 'this object class is moderately concrete' (if not 'final'),
and further indicate that 'these objects collectively are a set' which can be enumerated, 
verified exhaustively for matching etc

the idea is not necessarily that archetypes are inextensible, or don't have ramifications/subtypes etc

sugar for the layer that is going to be bloated in most
ontologies -- (a dog application might just want to say `dog Shepherd {}`...)
[not as a point of blame, note this inefficiency arises precisely in order to 'make room' for human cognitive order models/categories/logic flows (i.e., the constraint that 'orderly' systems in general need to operate within a small number of finite concepts, expose cheaply-connected logic centers,
exhibit a unitary domain model, etc)]

---


major differences from ruby so far are mainly within the dispatch/calling model -- we do not
dispatch barewords as method calls unless they have args or empty parens or something -- we will hand
back references to functions instead of blind calling things -- this has some implications but not 
so many -- ruby's object model is still a good approximation of what is going on in reflex

---

okay, so pattern action stuff -- i can imagine path literal 'lens' style structures being used to decompose
a matched object in a structure, i can also imagine some degree of archetype / class / tuple algebra
things should match against classes and superclasses ofc and regexes ...


--

i really do like arch as generalization of class keyword -- i do worry about weird implications but
most straightforward expressions shouldn't be impacted ?? we'll have to watch it -- but it's interesting
that it won't necessarily increase the size of the grammar

-------------------------------

concepts: a 'central mirror' app structure, where you build an explicit 'Domain' object
maybe you can wire with a for mlike `Reflex.domain(self)` or something?? and this
lets you ask for archetypes -- it makes it the parent space of the archetypes

maybe i'm just talking about modules at some point

it would be interesting to distinguish a Domain from a Module from a Package

there would be a handful of common domains that share a model

domain.package.module.function

i guess the idea would be that 'public' domains are common, code for them is shared?
(we're all building on same/similar data structures/abstractions?)

regardless it's just a language abstraction (if we want to share domains great, if they are easily shareable and have verification/contract properties, that's awesome)

the idea is really just that archetypes have a namespace, where we can reflect on those
archetypes

-----------

i almost think we could try to lift some of object's internals into reflex
let's wait until we have lists and strings though~!

------------------------

higher-order types with the archetypes ...

--------------------------------

okay, major refactors both of grammar and vm architecture -- everything now goes through a controller monolith kind of class

we can factor out narrower concerns from there, but the parameter madness should be reduced a little bit 

----

came here to say some things about mirrors, wands, holograms etc

i think the semantics for mirrors should be that they implicitly grab a binding when they're created 

(maybe if you give an object, it takes the binding 'of' that objects' self --- kind of strange but...)

okay, so if i create a mirror and 'stabilize' an image on it, I 'freeze' the binding
if i get passed a bound mirror, i can reflect on both bindings at once (current context + bound)

the big idea with mirrors is that they're not the object, but pass-along/mediate signals -- transduction

a mirror can reflect the entire environment also -- they're gateway into reification as well as reflective instrument

okay, so a mirror 'is' a binding or captures one; it can also 'freeze' that binding into place and get passed around
(and 'carry' that binding with it...)

a wand has to have a binding to create objects ---

the idea with a wand is that it can give you a 'portalized' JS object, a facade with wrappers around JS methods and
accessors/converters/lenses for JS attributes

so i could get a wand 'pointing' to the window object and start manipulating the dom, or a wand to fs and start doing filesystem ops

i think this is really still pending some more data structures for reflection (lists, strings, dicts) ----


---

okay, so what if `archetype` keyword is formal type constructor

(i know, but)

no type judgments on everything (though i reserve the right to add `x: Type` judgments...)

the idea would just be to permit simple structured tuples/sums/unions

and to destructure these in matching/messages

```
archetype Point = [ Number, Number ]
archetype Line = { a: Point, b: Point }

archetype List<T> = T[]

archetype Model = Number
archetype Message<T> = Inc | Dec | Store<T> | Load<T>

// okay, so far archetypes are just cosmetic
// how could we destructure them
update(model: Model, msg: Message<T>) {
  case(msg) {
    Inc -> model + 1
    Dec -> model - 1
    Store<T> -> ...
  }
}
```

this becomes a fully typed lang as soon as we do this
it'll infect everything

if we think about 'contracts' rather than formal types this might
not feel so scary? that is, runtime checks

although the presence of type judgments does make me wonder
i've heard the types for dynamic languages can be pretty wild

---

contracts in two senses then: between objects and the caller,
another layer of sanity checks (automated units, maybe you could say)

and then in case statements, exhaustion and 'destructuring' (to some degree)
of (arche)type expressions

the idea is that they're not full types, they're really objects
(and in most cases maybe you can substitute a class name for an archetype)

they just look like types

i feel like i'm trying to convince myself that it won't make the language huge

(and maybe undercut dynamism at some point? a deeper worry)

(imagining types like `RespondsTo<:blah>` and just wanting not that)

(i do love the idea of a bunch of optional test-ish kind of things)
(more type-decorations/annotations than judgments/inferences)
(maybe the question there is a better syntax/analog for annotations then??)
i was about to argue that `throw unless x.isA(Class)` isn't that bad but it's clearly awful compared to the `x: Class` sort of judgment in a parameter

i'll say that the parameter thing does seem weirdly cheap, at least as a runtime check

i like the idea of the type fragment of the language basically only ever
being accessible in a 'non-typing' context in case statements

----------------------------------------------------------------

---------

i think i do like `using` as a require-like



----------------------------------------------------------------

okay, so thinking more about archetypes -- if we do allow sums/unions, do we allow code to be created for those instances?
(what if they don't share anything at all??? i guess you have to know that in advance??)

how does it even work logically?

okay, so i'm now thinking of archetypes as something like 'virtual types' that the runtime can verify for you

```
archetype Push<T> = T
archetype Zero;
archetype Inc;
archetype Dec;
archetype Model = Number
archetype Message<A> = Inc | Dec | Push<A> | Zero

class Model {
  inc(): Model { self + 1 }
  dec(): Model { self - 1 }
  zero(): Model { 0 }
}

handle(model: Model, message: Message<Model>): State {
  case(message) {
    when Push<T> then message as Model
    else model.send(&message) // types could be converted to messages based on name??
  }
}

model = Model.new()
newModel = handle(model, Inc) # model is 1
newModel = handle(model, 2)   # model is 2
newModel = handle(model, Dec) # model is 1
```

why couldn't we just do static typechecks at this point (we could definitely validate a case stmt exhausts the type...)

---------------------

okay, if archetypes are ultimately about 'defining messages' (kind of interesting link between the paradigms)
...or at least if that's our "archetypal" use case...

what do we do about abstract types, generics etc? do we permit higher-order types



------------

i think the VM is called 'diamond' (!)

----------------------------------

so we're a little LESS expressive than ruby in certain ways, on purpose

some of this is to make it intentionally EASIER TO READ certain things

we permit optional parens, but member access without args is always an object, never a method call

so that's actually two dispatch mechanisms

one of which goes through send, and another which is bare access

we may want to disallow bare access to members outside of classes
(this would compel us to start building attr accessor-style hooks for embedding data elements into structures like this)

--------------------------------

maybe each frame should have its own stack??

------

wow, each is actually going!!!!!!!!!

--------------------------------

came to say:
 
   maybe we should have different 'bases' for reflection/reification?
   mirrors are clearly for reflection, maybe they could give you a binding
   binding is for reification, maybe you could just get one directly from kernel
   (it should be really clear you're doing metaprogramming stuff at this point, is one idea...)
   is there a different metaphor for binding, something that wraps around it?
   (mechanically it ofc can just live on the kernel...)

---

just struck me: ruby has implicit tuples for destructuring, so it wouldn't be too weird to have them as an explicit structure
(maybe it would play merry hell with the existing grammar to have to add a tuple-lit though?? between fn lits and parenthesizes exprs it is already kind of busy territory...)
((can you omit parens on a tuple lit? that seems crazy but!))

--------

(thinking abt checklist for 0.1 --)
[x] unicode
[ ] basic array/string/number suite
[ ] hash lit + suite
[ ] binding
[ ] mirror
[ ] throw
[ ] yield
[ ] iterators
[ ] enumerable
[ ] modules
[ ] hammer (spec framework) / chisel (spec runner?)
[ ] tree lit
[ ] tuples?
--
wand (ffi objs)
sketch of programming reference/guide
web repl
--
files/network/math
webserver
docs?
packages?

------

we need a full model/class for the 'reference' to a function, so we can differentiate
(between having a block arg, having one passed as a reference, and not having one at all)

---------------------

difference for xml lit could be tree diff!!
(a 'tree delta' object consisting of paths/cuts/additions??)

i was thinking that multiply is replicate, that should work for arrays/strings
but maybe it works for hashes, in that it gives you a graph with a number of connections (the number of connections could be an analogue for 'weight' maybe??) -- you could get a doubly-connected graph with `(hash * hash.transpose)`


##

increasingly feeling like ruby had something with the 'send the message' == call the method sort of approach
(thinking through some complicated logic with setting custom getters but just realizing the asymmetry between omitting parens everywhere
but a simple/niladic function call seems weird -- it does raise the question of how to get access to the member itself, but maybe that's
a separate problem, something like a mirror could do??)

i do like being able to get at and manipulate directly the member value --

what is the distinction between externally visible attributes, internal members and functions you can call?

okay, there's several spheres 

    ( object )      environment

The object itself has properties that the environment can't see; these are only visible from within the object.
(When the caller is also self.)
These are private instance variables, that can get get or set only by being self and calling instance_var_get/set.

When the environment calls one of these, it's an error. It's the same as if the object didn't exist. 
(Maybe some objects are 'helpful' and will point out you're poking into internal implementations)

Alternatively, the object exposes members that can be accessed by calling it.

The object is called by a caller in the environment or that is itself. (If the caller is itself, private member variables are visible/accessible.)

When the object is called, the message is dispatched -- as a reified message object, even if just a (message, ...args, &block) tuple --
to the object's `send` method...

---------------------

thinking about exceptions. what if objects can capture all exceptions

and what if exceptions aren't different than 'events' which objects can also handle as a concept

a generalization of try-catch -- 

a generalized `handle(event)` method that an object can implement

`throw` is a specialization of a more general `emit`

maybe meta is interesting here? i.e. `on_error` and `on_receive`

object `send` for messages -- `handle` for events

```
class Printer
  write(msg) {
    if (!device.ready) { throw Error }
    emit :warning, msg
  }
  on_exception(e) { puts "ERROR: " + e.message }
  on_warning(msg) { puts "WARN: " + msg }
end
```


------------

somewhat perilously, we have altered the grammar to be more flexible and support ruby-style do/end blocks
this will hopefully aid readability/clarity but -- i think the official position is that it's a matter of taste, and do what you like, but maybe keep within a single style in a single codebase etc

---

```
archetype Props = { name: String }
component HelloApp<Props>
  def show props
    <div className='hello'>
      <p>Hi there, {props.name}</p>
    </div>
  end
end
```

```
archetype Model = Integer
archetype Increment = 'inc'
archetype Decrement = 'dec'
archetype Message = Increment | Decrement
def update(model, message)
  case message
    when Increment then model+1
    when Decrement then model-1
  end
end

def render(model)
  <div className='counter'>
    {model}
    <button onClick={Increment}>+</button>
    <button onClick={Decrement}>-</button>
  </div>
end

App.start 0, render, update
```

------

was trying to write something abotu the execution model, talking about archetypes, which
basically makes the case both for and against them:

- However, sometimes we want transparency. Ruby has BasicObject for this purpose but we are thinking something
  closer to an algebraic data type, where you can exhaustively (and substructurally) pattern match against it,
  and maybe even reflect over it to some degree (i.e., open a class definition for `String | Integer | Array`,
  which feels very weird to be sure but strangely powerful -- this kind of thing would obviously push you so 
  far up the reflective tower that you're checking every object every message for every possible archetype it 
  could match so maybe this isn't the greatest idea?)
  (In particular are thinking this may help some of goals further on, wrapping around Ohm for a grammar literal notation...)


obviously this would be a nightmare to check every archetype everytime

and what exactly is that use case anyway?

i guess the intellectual curiousity question would be how to handle algebraic types

```
archetype RespondsTo<:add> {
  multiply(n) { n.times { self.add(self) } }
}
```

and i guess if you think of archetypes as 'beneath' the dispatch mechanisms, just before method missing would crash things
an archetype could pick it up

i'm thinking really of exception handling (i guess the thought is realyl a kind of generalized event emission and exceptino handling as a special kind of event)

---------

feeling like try-catch is a special case of continuations?

not sure but generalized event handlers seem interesting

(again could be a bridge to fn paradigm? 'wire'/signals?)

```
class Foo
  def on_method_missing(sym,...args,&block)
    # blah
  end
end
```

so meth missing would be a special case of more general exception handler logic
the model would be something like: an implicit try catch wraps every invocation on this class
i.e. if any exception like that would be thrown while a frame with this object is self is on the call stack...
(invoke this)

i think i'd actually prefer this in general to `try/catch` blocks but not having them entirely seems a bit weird?
maybe they could be rebuilt along other lines

i guess the other thought here is module-wide catchers... if you define `on_exception` in a module, it should work
whenever any class in that module is in view

i like the idea of a `catch` as "part" of method definition

```
def read stream
  stream.readChunk() until stream.closed()
catch EndOfStream => ex
  stream.close()
end
```

in our notation it would have to be a lot bulkier
```
class StreamReader
  read(stream)
    chunks.push(stream.readChunk()) until stream.closed()
  end

  on_end_of_stream(stream)
    stream.close()
  end
end
```

----------------------

okay, that was a long journey!!
okay, so collected was getting smashed!!!
how do we shadow locals??
we DO want to expose to locals to like blocks in scope
but functions should be able to define their own locals and not get them trashed!
(i.e., by unrelated invocations of the same function, possibly within a call from this function!)
blocks should be able to see into parent functions, but that's it!
the idea of seeing everything on the stack is NOT right
when we're in here [ Enumerator.collect's isExhausted/next loop], both things are trying to write to collected..

well, that was a lot. it does seem like some other weird/spooky things that had to be written
very particularly are caused by this. 

and it's one of those funny things. i sort of knew this in the back of my mind, that shadowing would
bite us eventually! :)

okay, so approaches. obviously we need to rethink how we're exposing variables to child scopes.
in general... they only see their parent frame if they're literally in block scope within that function.
classes also retain scope, but methods should have locals that don't trash each other.

that was basically the case: a reentrant instance method (Enumerator.collect, when we setup a
recursive structure like `1.times { 1.times { 1 }}` which should just construct `[[1]]`) that 
ended up trashing its local variables inside a loop (so 'children' calls were trying to insert
an array into itself!!)

----------

rough plan of attack

- bugs (shadowing)
- symbol
- hash/dict structure
( okay! )

- yield?
- case?
- tree lit/xml
- web repl

- stdlib (file, network, math)
- json, web, html, javascript, css, html?
- web component?
- pkg mgr/hub?
- clientserver?

--------------------

things maybe before yield/case and tree lit/xml -->

- obj attrs?

i think the idea is that there are 'only' methods??

- method missing??

objects should be able to intercept meth missing!!

- mirror/binding

---

old checklist:

[ ] binding [ ] mirror [ ] throw [ ] yield [ ] iterators [ ] enumerable [ ] modules [ ] hammer (spec framework) / chisel (spec runner?) [ ] tree lit [ ] tuples?
wand (ffi objs) sketch of programming reference/guide web repl
files/network/math webserver docs? packages?

- a lot of things kind of working!!
- maybe it's time to 'flip over' in the sense of we could start doing testing in reflex
  (hammer, spec dsl?)
- ffi also seems generally useful
- bring back yield / figure out throw sounds good too
- mirror and binding would be great
- xml as native tree data type sounds great too?
- lots of good things feel unlocked -- a general pass of cleanup and doc would be nice also??

---

controller impl could be more straightforward if we had a helper that could invoke
a function AND permit execution to continue, returning the value when done (ie handing
back the value returned by the function it was asked to execute...)

i guess that's a promise? and i guess it would mean re-architecting parts of the engine
to be async

honestly maybe that's good, there's things that it feels painful to do without SOME
async in the architecture (pause between instructions, for instance, which would be nice
for debugging and maybe visualization)

-------

what if reflex processes on the same machine were 'aware' of each other?
ie could send messages across without much ceremony??
(what different kind of tools could we offer -- a heads up dashboard kind of app server...
something that runs on the machine and monitors all the processes)
(a 'single' VM for all the processes on the same machine seems kind of interesting)
(distributed reflex is another use case that should be investigated... drb-over-http is sort of the thought)

---


okay, so it seems like our message dispatching infrastructure...
is not quite ready to handle method missing?
this is actually kind of a weird aspect of the VM i've wanted to address for awhile
[i keep thinking there should be some kind of minimal lang the vm understands that we can compile things into...
(ie instead of) having to write bytecode for everything...!]
anyway the VM infrastructure for message passing is a little disjointed
maybe we should just review things a bit

there's a few instructions related to message passing
first we have `call`, which sends a message to an object but doesn't invoke it or do anything WITH it
(that asymmetry is a little weird -- i think it's related to object attrs?? )
i think maybe it pushes the result onto the stack
(yeah, that's the idea, call the object with the message, and push the result)

okay, then SEPARATELY we have `invoke` which takes a function, constructs a new activation record and pushes it onto the list of frames
(putting the execution pointer at the function head, with args assigned to params as locals)

we tried merging these at one point with `dispatch` -- the idea being we want to send a message to an object
and assume it returns a function, then invoke that function without arguments -- i think this originated roughly
from when we needed to do conditional statements, and being able to have one instruction to call `true()/false()` was nice?

i think all this is pointing to: we want a more general message passing mechanism, that more cleanly handles things
like method missing

basically, in the object send logic, we've already lost track of the arguments

i think that needs to be an 'atomic' operation, sending a message to an object
(attrs are just a method that returns the value of the attribute...)

okay, so that means we have a single method invocation strategy --
or i guess effectively a new one alongside the old ones but maybe they can be realigned --
the semantics of this new strategy are like:
take an object, a message, args + block and dispatch it -- get the member, invoke it with the args
(handle special cases like method missing etc)
do all that, then run the machine til that function returns??
i'm not sure we need to recurse over that, just prepping for the call is enough
okay, so the idea is that we replace all the `call`/`invoke` methods with a more general `invoke_dynamic` (?)
it expects stack structure like args,method,object -- ??

okay, so one structural issue
namely that in order to do the full dispatch dance, we need to be able to invoke functions 'synchronously'
or wait for them to return
this is most clear with respondsTo but methodMissing is the same problem really... 
ie we need to call user-defined respondsTo

jeez could we write object.send in reflex at this point??
maybe we need some binding tricks to tie it together but
ultimately that's good but simplifying/improving the vm seems good too?
i'm not sure i want to rewrite the thing to be async right away, it seems like a lot?
basically, the idea would be that we could 'call and follow' an invocation, waiting for it to return
i'm not sure writing in reflex 'purely' even makes that much sense, although we could try to do it ofc??

we need to run the machine, checking if our execution frame has been returned from yet
it's like execute until with the predicate that the instruction is return and frame is current frame...


    private dynamicInvoke(receiver: ReflexObject, method: string, ...args: Value[]): Value {
        this.push(args);
        this.push(receiver);
        this.push(method);
        this.call();
        this.invoke(args.length, false)
        let watchedFrame = this.frame;
        this.machine.executeLoop((instruction: Instruction) => {
            let [op] = instruction;
            return op === 'ret' && this.frame === watchedFrame
        });
        let result = this.stack[this.stack.length - 1]
        return result
    }

------------------------

considering hash to obj
(makes sense but we'd need hash to have native impl of hash, which we want anyway)

------------------------

kind of thinking better of the dynamic invoke thing btw
thinking now it makes more sense to push as much dispatch logic INTO reflex as possible
and fight through that a little bit?
anyway, method missing / yield and any additional things around blocks, destructuring and calling methods
i want to make sure all this is super solid, and that the basic data structures are working correctly
at that point!! we can push towards web
anyway currently working through destructuring, which should unlock some of those abilities to write the
method missing/send kind of logic in pure reflex...

----------------------------------------------------------------

circling back to thinking about low-cost typechecks at function boundaries
just something you could turn on in test and get warnings about in prod
low-drama, just semicolon and the expected class expression? `reverse(): String { self.collect().reverse().join() }`

