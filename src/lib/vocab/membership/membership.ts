import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

export interface Membership extends Static<typeof MembershipSchema> {}
export const MembershipSchema = Type.Object(
	{
		persona_id: Type.Number(),
		community_id: Type.Number(),
	},
	{$id: 'Membership', additionalProperties: false},
);

export interface MembershipParams extends Static<typeof MembershipParamsSchema> {}
export const MembershipParamsSchema = Type.Object(
	{
		persona_id: Type.Number(),
		community_id: Type.Number(),
	},
	{$id: 'MembershipParams', additionalProperties: false},
);
