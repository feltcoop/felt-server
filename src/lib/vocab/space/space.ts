import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';
import type {ValidateFunction} from 'ajv';

import {ajv} from '$lib/util/ajv';

export interface Space {
	space_id: number;
	name: string;
	url: string; // TODO should this be computed from the name/community? or is it more useful to cache with both the names of the space and community?
	media_type: string;
	content: string;
}
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
export const validateSpaceParams = (): ValidateFunction<SpaceParams> =>
	_validateSpaceParams || (_validateSpaceParams = ajv.compile(SpaceParamsSchema));
let _validateSpaceParams: ValidateFunction<SpaceParams> | undefined;
