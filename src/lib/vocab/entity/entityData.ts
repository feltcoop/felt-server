export type EntityData =
	| DirectoryEntityData
	| NoteEntityData
	| ArticleEntityData
	| CollectionEntityData
	| TombstoneEntityData;

export interface BaseEntityData {
	type: string;
	content?: string;
	name?: string;
	checked?: boolean;
}

export interface DirectoryEntityData extends BaseEntityData {
	type: 'Collection';
	space_id: number;
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
