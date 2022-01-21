export type EntityData = NoteEntityData | ArticleEntityData;

export interface BaseEntityData {
	type: string;
	content?: string;
	name?: string;
}

export const EntityDataSchema = {
	$id: 'https://felt.social/vocab/EntityData.json',
	type: 'object',
	properties: {
		type: {type: 'string'},
		content: {type: 'string'},
		name: {type: 'string'},
	},
	required: ['type'],
	additionalProperties: false,
};

export interface NoteEntityData extends BaseEntityData {
	type: 'Note';
	content: string;
}

export interface ArticleEntityData extends BaseEntityData {
	type: 'Article';
	content: string;
	name: string;
}
