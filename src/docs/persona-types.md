# Persona types

> the `type` property of personas

## `'account'` personas

Account personas are created by users and have an `account_id`
and a `community_id` that points to their [`'personal'` community](./community-types.md).
They act as a privacy shield to protect account identity;
when you join a community, you join as one of your personas.
They can be created and deleted as desired.

## `'community'` personas

Community personas are created for every community and have
They currently have no behavior in Felt,
but the plan is to allow them to act as normal personas
under the control of the entire community's membership.
