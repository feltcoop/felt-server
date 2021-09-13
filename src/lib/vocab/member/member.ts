import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

// TODO is `Membership` the better name here? or is this just one kind of `Role`?
export interface Member extends Static<typeof MemberSchema> {}
export const MemberSchema = Type.Object(
	{
		persona_id: Type.Number(),
		community_id: Type.Number(),
		name: Type.Optional(Type.String()), // TODO delete this, is returned in one query but that's now obsolete
	},
	{$id: 'Member', additionalProperties: false},
);

export interface MemberParams extends Static<typeof MemberParamsSchema> {}
export const MemberParamsSchema = Type.Object(
	{
		persona_id: Type.Number(),
		community_id: Type.Number(),
	},
	{$id: 'MemberParams', additionalProperties: false},
);
