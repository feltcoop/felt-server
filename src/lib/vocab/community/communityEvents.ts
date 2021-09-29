import {Type} from '@sinclair/typebox';

import {CommunitySchema} from '$lib/vocab/community/community';
import {MembershipSchema} from '$lib/vocab/membership/membership';

export const read_communities_params = Type.Object(
	{
		// TODO query params
	},
	{$id: 'read_communities_params', additionalProperties: false},
);
export const read_communities_response = Type.Object(
	{
		communities: Type.Array(CommunitySchema),
	},
	{$id: 'read_communities_response', additionalProperties: false},
);

export const read_community_params = Type.Object(
	{
		community_id: Type.Number(),
	},
	{$id: 'read_community_params', additionalProperties: false},
);
export const read_community_response = Type.Object(
	{
		community: CommunitySchema,
	},
	{$id: 'read_community_response', additionalProperties: false},
);

export const create_community_params = Type.Object(
	{
		name: Type.String(),
		persona_id: Type.Number(),
	},
	{$id: 'create_community_params', additionalProperties: false},
);
export const create_community_response = Type.Object(
	{
		community: CommunitySchema,
	},
	{$id: 'create_community_response', additionalProperties: false},
);

export const create_membership_params = Type.Object(
	{
		persona_id: Type.Number(),
		community_id: Type.Number(),
	},
	{$id: 'create_membership_params', additionalProperties: false},
);
export const create_membership_response = Type.Object(
	{
		membership: MembershipSchema,
	},
	{$id: 'create_membership_response', additionalProperties: false},
);
