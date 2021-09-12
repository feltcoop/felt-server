import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

import {toValidateSchema} from '$lib/util/ajv';

export type Space = Static<typeof SpaceSchema>;
export const SpaceSchema = Type.Object(
	{
		space_id: Type.Number(),
		name: Type.String(),
		url: Type.String(),
		media_type: Type.String(),
		content: Type.String(),
	},
	{$id: 'Space', additionalProperties: false},
);
export const validateSpace = toValidateSchema<Space>(SpaceSchema);

// TODO the `community_id` belongs here, but it's not used in the REST post payload, only the params
export type SpaceParams = Static<typeof SpaceParamsSchema>;
export const SpaceParamsSchema = Type.Object(
	{
		community_id: Type.Number(),
		name: Type.String(),
		url: Type.String(),
		media_type: Type.String(),
		content: Type.String(),
	},
	{$id: 'SpaceParams', additionalProperties: false},
);
export const validateSpaceParams = toValidateSchema<SpaceParams>(SpaceParamsSchema);

//TODO make TypeScript String enum
export const SpaceTypes = {
	Chat: 'Chat',
	Board: 'Board',
	Forum: 'Forum',
	Notes: 'Notes',
	Voice: 'Voice',
	Iframe: 'Iframe',
};
