export interface Space {
	space_id: number;
	name: string;
	url: string;
	view: SpaceView;
	created: Date;
	updated: Date | null;
	community_id: number;
}
export interface SpaceView {
	type: string;
	props: SpaceViewProperties;
	mediaType: string;
}
export interface SpaceViewProperties {
	data: string;
}
export const SpaceSchema = {
	$id: 'https://felt.social/vocab/Space.json',
	type: 'object',
	properties: {
		space_id: {type: 'number'},
		name: {type: 'string'},
		url: {type: 'string'},
		view: {type: 'object', tsType: 'SpaceView'},
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
