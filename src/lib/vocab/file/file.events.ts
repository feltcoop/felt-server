import type {EventInfo, ClientEventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

// TODO generate the type from the schema with json-schema-to-typescript
const create_file_params_type = `{
	actor_id: number;
	space_id: number;
	content: string;
}`;
const create_file_response_type = '{file: File}';
export const create_file: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'create_file',
	params: {
		type: create_file_params_type,
		schema: {
			$id: 'https://felt.social/vocab/create_file_params.json',
			type: 'object',
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
			$id: 'https://felt.social/vocab/create_file_response.json',
			type: 'object',
			properties: {
				file: {$ref: 'File.json'},
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
export const read_files: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'read_files',
	params: {
		type: read_files_params_type,
		schema: {
			$id: 'https://felt.social/vocab/read_files_params.json',
			type: 'object',
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
			$id: 'https://felt.social/vocab/read_files_response.json',
			type: 'object',
			properties: {
				files: {type: 'array', items: {$ref: 'File.json'}},
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
export const query_files: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'query_files',
	params: read_files.params,
	// TODO Can/should this compose the `read_files` event info?
	// Could make the `response` available.
	returns: 'Readable<Readable<File>[]>',
};

export const events: EventInfo[] = [create_file, read_files, query_files];
