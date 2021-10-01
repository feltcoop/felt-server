export interface File {
	file_id: number;
	actor_id: number;
	space_id: number;
	content: string;
}
export const FileSchema = {
	$id: 'https://felt.social/vocab/File.json',
	additionalProperties: false,
	properties: {
		file_id: {type: 'number'},
		actor_id: {type: 'number'},
		space_id: {type: 'number'},
		content: {type: 'string'},
	},
	required: ['file_id', 'actor_id', 'space_id', 'content'],
};

export interface FileParams {
	actor_id: number;
	space_id: number;
	content: string;
}
export const FileParamsSchema = {
	$id: 'https://felt.social/vocab/FileParams.json',
	additionalProperties: false,
	properties: {
		actor_id: {type: 'number'}, // `persona_id` -- must be validated against the authenticated `account_id`
		space_id: {type: 'number'},
		content: {type: 'ntring'},
	},
	required: ['actor_id', 'space_id', 'content'],
};
