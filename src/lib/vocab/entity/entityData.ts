export type EntityData =
	| NoteEntityData
	| ArticleEntityData
	| CollectionEntityData
	| TombstoneEntityData;

export interface BaseEntityData {
	type: string;
	content?: string;
	name?: string;
	checked?: boolean;
	community_id?: number; // populated for directories, `undefined` for all other entities
	space_id?: number; // populated for directories, `undefined` for all other entities
}

export interface NoteEntityData extends BaseEntityData {
	type: 'Note';
	content: string;
}

export interface ArticleEntityData extends BaseEntityData {
	type: 'Article';
	content: string;
	name: string;
}

export interface CollectionEntityData extends BaseEntityData {
	type: 'Collection';
	name: string;
}

export interface TombstoneEntityData extends BaseEntityData {
	type: 'Tombstone';
	formerType: string;
	deleted: Date;
	previousType: string;
}
