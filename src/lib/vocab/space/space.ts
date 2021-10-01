import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

export interface Space extends Static<typeof SpaceSchema> {}
export const SpaceSchema = Type.Object(
	{
		space_id: Type.Number(),
		name: Type.String(),
		url: Type.String(),
		media_type: Type.String(),
		content: Type.String(),
	},
	{$id: 'https://felt.social/vocab/Space.json', additionalProperties: false},
);

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
	{$id: 'https://felt.social/vocab/SpaceParams.json', additionalProperties: false},
);

export enum SpaceType {
	Home = 'Home',
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
