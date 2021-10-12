export interface Space {
	space_id: number;
	name: string;
	url: string;
	media_type: string;
	content: string;
	created: Date;
	updated: Date | null;
}
export const SpaceSchema = {
	$id: 'https://felt.social/vocab/Space.json',
	type: 'object',
	properties: {
		space_id: {type: 'number'},
		name: {type: 'string'},
		url: {type: 'string'},
		media_type: {type: 'string'},
		content: {type: 'string'},
		created: {type: 'object', format: 'date-time'},
		updated: {type: ['object', 'null'], format: 'date-time'},
	},
	required: ['space_id', 'name', 'url', 'media_type', 'content', 'created', 'updated'],
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
