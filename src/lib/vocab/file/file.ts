export interface File {
	file_id: number;
	actor_id: number;
	space_id: number;
	content: string;
	created: Date;
	updated: Date | null;
}
export const FileSchema = {
	$id: 'https://felt.social/vocab/File.json',
	type: 'object',
	properties: {
		file_id: {type: 'number'},
		actor_id: {type: 'number'},
		space_id: {type: 'number'},
		content: {type: 'string'},
		created: {type: 'object', format: 'date-time'},
		updated: {type: ['object', 'null'], format: 'date-time'},
	},
	required: ['file_id', 'actor_id', 'space_id', 'content', 'created', 'updated'],
	additionalProperties: false,
};
