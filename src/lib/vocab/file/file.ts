export interface File {
	file_id: number;
	actor_id: number;
	space_id: number;
	content: string;
}
export const FileSchema = {
	$id: 'https://felt.social/vocab/File.json',
	type: 'object',
	properties: {
		file_id: {type: 'number'},
		actor_id: {type: 'number'},
		space_id: {type: 'number'},
		content: {type: 'string'},
	},
	required: ['file_id', 'actor_id', 'space_id', 'content'],
	additionalProperties: false,
};
