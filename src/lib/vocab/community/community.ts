import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

import type {Space} from '$lib/vocab/space/space.js';
import type {Member} from '$lib/vocab/member/member.js';
import {toValidateSchema} from '$lib/util/ajv';

export interface Community {
	community_id: number;
	name: string;
	spaces: Space[];
	members: Member[];
}
// TODO can't get the static inference correct here -- change to schema after normalizing data, or maybe generate plain types
// export type Community = Static<typeof CommunitySchema>;
export const CommunitySchema = Type.Object(
	{
		community_id: Type.Number(),
		name: Type.String(),
		// spaces: Type.Ref(SpaceSchema), // TODO reference types
		// members: Type.Number(),
	},
	{$id: 'CommunitySchema', additionalProperties: true}, // TODO `true` is a hack
);
export const validateCommunity = toValidateSchema<Community>(CommunitySchema);

export interface CommunityParams extends Static<typeof CommunityParamsSchema> {}
export const CommunityParamsSchema = Type.Object(
	{
		name: Type.String(),
		persona_id: Type.Number(),
	},
	{$id: 'CommunityParams', additionalProperties: false},
);
export const validateCommunityParams = toValidateSchema<CommunityParams>(CommunityParamsSchema);

// TODO think through alternatives to this, probably caching `membersById` on `data`
export interface CommunityModel {
	community_id: number;
	name: string;
	spaces: Space[];
	members: Member[];
	membersById: Map<number, Member>;
}

export const toCommunityModel = (community: Community): CommunityModel => ({
	...community,
	membersById: new Map(community.members.map((member) => [member.persona_id, member])),
});

export interface CommunitySpaces {
	community_id: number;
	space_id: number;
}

export type CommunitySpacesParams = CommunitySpaces;

export interface PersonaCommunity {
	persona_id: number;
	community_id: number;
}

export type PersonaCommunityParams = PersonaCommunity;
