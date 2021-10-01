export interface Space {
	space_id: number;
	name: string;
	url: string;
	media_type: string;
	content: string;
}
export const SpaceSchema = {
	$id: 'https://felt.social/vocab/Space.json',
	properties: {
		space_id: {type: 'number'},
		name: {type: 'string'},
		url: {type: 'string'},
		media_type: {type: 'string'},
		content: {type: 'string'},
	},
	required: ['space_id', 'name', 'url', 'media_type', 'content'],
	additionalProperties: false,
};

// TODO the `community_id` belongs here, but it's not used in the REST post payload, only the params
export interface SpaceParams {}
export const SpaceParamsSchema = {
	$id: 'https://felt.social/vocab/SpaceParams.json',
	properties: {
		community_id: {type: 'number'},
		name: {type: 'string'},
		url: {type: 'string'},
		media_type: {type: 'string'},
		content: {type: 'string'},
	},
	required: ['community_id', 'name', 'url', 'media_type', 'content'],
	additionalProperties: false,
};

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
