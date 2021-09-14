import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

import {toValidateSchema} from '$lib/util/ajv';

export interface Space extends Static<typeof SpaceSchema> {}
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
export interface SpaceParams extends Static<typeof SpaceParamsSchema> {}
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

export enum SpaceType {
	Room = 'Room',
	Board = 'Board',
	Forum = 'Forum',
	Notes = 'Notes',
	Voice = 'Voice',
	Iframe = 'Iframe',
}
export const spaceTypes: SpaceType[] = Object.keys(SpaceType) as SpaceType[];

// TODO refactor? rename? or how to define this?
export interface SpaceViewData {
	type: SpaceType;
	props: SpaceProps;
}
export type SpaceProps = any; // TODO generic per type?
