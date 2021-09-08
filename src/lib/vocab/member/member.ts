import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

// TODO is `Membership` the better name here? or is this just one kind of `Role`?
export type Member = Static<typeof MemberSchema>;
export const MemberSchema = Type.Object(
	{
		persona_id: Type.Number(),
		community_id: Type.Number(),
		name: Type.String(),
	},
	{$id: 'Member', additionalProperties: false},
);

export type MemberParams = Static<typeof MemberParamsSchema>;
export const MemberParamsSchema = Type.Object(
	{
		persona_id: Type.Number(),
		community_id: Type.Number(),
	},
	{$id: 'MemberParams', additionalProperties: false},
);
