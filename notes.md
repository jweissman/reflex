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

