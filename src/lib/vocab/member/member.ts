import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

// TODO is `Membership` the better name here? or is this just one kind of `Role`?
export interface Member {
	persona_id: number;
	community_id: number;
	name: string;
}

export type MemberParams = Static<typeof MemberParamsSchema>;
export const MemberParamsSchema = Type.Object(
	{
		persona_id: Type.Number(),
		community_id: Type.Number(),
	},
	{additionalProperties: false},
);
