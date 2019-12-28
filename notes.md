# core types
## object
in theory, every entity in the system descends from object
## class
every entity in the system also has a class, which has a member `super` that is its parent inheritance-wise
## function
a function is a callable entity that can wrap a raw JS function or have an implementation somewhere in the vm code (in which case it is more like a label that tracks things like arity etc)

----------------------------------------------------------------

- we have kept the core type system to the small core above to build a kind of shell that
  we can try to use to model the basic type system elements (i.e., a core language and testing harness
  with just the above tested in terms of themselves, without the added concerns of additional types/syntax)
- the extended type system should try to comprise at least the basics (with syntax support):
    * strings, numbers, booleans and lists
    * possibly: maps, tuples, ranges, nils/options, enums, symbols

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