import type {EventInfo} from '$lib/vocab/event/event';

// TODO generate the type from the schema with json-schema-to-typescript
const create_file_params_type = `{
	actor_id: number;
	space_id: number;
	content: string;
}`;
const create_file_response_type = '{file: File}';
export const create_file: EventInfo = {
	name: 'create_file',
	params: {
		type: create_file_params_type,
		schema: {
			$id: 'create_file_params',
			properties: {
				actor_id: {type: 'number'},
				space_id: {type: 'number'},
				content: {type: 'string'},
			},
			required: ['actor_id', 'space_id', 'content'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${create_file_response_type}>`,
		schema: {
			$id: 'create_file_response',
			properties: {
				file: {$ref: '#/$defs/file'},
			},
			required: ['file'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${create_file_response_type}>>`,
	route: {
		path: '/api/v1/spaces/:space_id/files',
		method: 'POST',
	},
};

const read_files_params_type = '{space_id: number}';
const read_files_response_type = '{files: File[]}';
export const read_files: EventInfo = {
	name: 'read_files',
	params: {
		type: read_files_params_type,
		schema: {
			$id: 'read_files_params',
			properties: {
				space_id: {type: 'number'},
			},
			required: ['space_id'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${read_files_response_type}>`,
		schema: {
			$id: 'read_files_response',
			properties: {
				files: {type: 'array', items: {$ref: '#/$defs/file'}},
			},
			required: ['files'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${read_files_response_type}>>`,
	route: {
		path: '/api/v1/spaces/:space_id/files',
		method: 'GET',
	},
};

// `query_files` differs from `read_files` in that
// it returns a reactive store containing the requested files.
// Its API could be expanded to give callers access to its async status or promise,
// maybe via a third `options` arg with callbacks.
export const query_files = {
	name: 'query_files',
	params: read_files.params,
	response: {
		type: 'void',
		schema: null,
	},
	returns: 'Readable<Readable<File>[]>',
};

export const events = [create_file, read_files, query_files];
