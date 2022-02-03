# Community types

> the `type` property of communities

## `'standard'` communities

Standard communities are the default kind;
you can create them, invite other personas, and all the rest.

## `'personal'` communities

Felt has a special kind of community called a **personal community**.
It's a bit of a misnomer; it's more of a personal workspace, a world scoped to a persona,
than a community, but it inherits most of the qualities of `'standard'` communities,
with some important differences:

- a personal community is created automatically for every [`'account'` persona](./persona-types.md);
  this is the only way they're created
- a personal community has the same `name` as its persona
- a personal community's membership includes its owning persona,
  and **no other personas may be invited as members**,
  including other personas under the same account
