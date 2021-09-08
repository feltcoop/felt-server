import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

export interface Space {
	space_id: number;
	name: string;
	url: string; // TODO should this be computed from the name/community? or is it more useful to cache with both the names of the space and community?
	media_type: string;
	content: string;
}

export type SpaceParams = Static<typeof SpaceParamsSchema>;
export const SpaceParamsSchema = Type.Object(
	{
		name: Type.String(),
		url: Type.String(),
		media_type: Type.String(),
		content: Type.String(),
	},
	// {additionalProperties: false}, // TODO how to use this with Type.Intersect?
);
