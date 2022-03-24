export type EntityData =
	| NoteEntityData
	| ArticleEntityData
	| CollectionEntityData
	| TombstoneEntityData
	| DirectoryEntityData;

export interface BaseEntityData {
	type: string;
	content?: string;
	name?: string;
	checked?: boolean;
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
	deleted: Date;
	previousType: string;
}

export interface DirectoryEntityData extends BaseEntityData {
	type: 'Directory';
}
