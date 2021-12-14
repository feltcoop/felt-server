export interface Space {
	space_id: number;
	name: string;
	url: string;
	media_type: string;
	content: string;
	created: Date;
	updated: Date | null;
	community_id: number;
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
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
		community_id: {type: 'number'},
	},
	required: [
		'space_id',
		'name',
		'url',
		'media_type',
		'content',
		'created',
		'updated',
		'community_id',
	],
	additionalProperties: false,
};

export enum ViewType {
	Home = 'Home',
	Room = 'Room',
	Board = 'Board',
	Forum = 'Forum',
	Notes = 'Notes',
	Voice = 'Voice',
	Iframe = 'Iframe',
}
export const viewTypes: ViewType[] = Object.keys(ViewType) as ViewType[];

// TODO refactor? rename? or how to define this?
export interface SpaceViewData {
	type: ViewType;
	props: SpaceProps;
}
export type SpaceProps = any; // TODO generic per type?
