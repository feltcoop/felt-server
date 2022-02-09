export type EntityData = NoteEntityData | ArticleEntityData | TaskEntityData;

export interface BaseEntityData {
	type: string;
	content?: string;
	name?: string;
}

export interface NoteEntityData extends BaseEntityData {
	type: 'Note';
	content: string;
}

export interface TaskEntityData extends BaseEntityData {
	type: 'Task';
	content: string;
	name: string;
	done: boolean;
}

export interface ArticleEntityData extends BaseEntityData {
	type: 'Article';
	content: string;
	name: string;
}
