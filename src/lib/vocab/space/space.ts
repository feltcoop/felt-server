import type {ViewData} from '../view/view';

export interface Space {
	space_id: number;
	name: string;
	url: string;
	media_type: string;
	view: ViewData;
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
		view: {type: 'object', tsType: 'ViewData'},
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
		community_id: {type: 'number'},
	},
	required: ['space_id', 'name', 'url', 'media_type', 'view', 'created', 'updated', 'community_id'],
	additionalProperties: false,
};
