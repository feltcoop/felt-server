import type {EventInfo, ClientEventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const create_file: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'create_file',
	params: {
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
		schema: {
			$id: 'https://felt.social/vocab/create_file_response.json',
			type: 'object',
			properties: {
				file: {$ref: 'File.json', tsType: 'File'},
			},
			required: ['file'],
			additionalProperties: false,
		},
	},
	returns: 'Promise<CreateFileResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id/files',
		method: 'POST',
	},
};

export const read_files: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'read_files',
	params: {
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
		schema: {
			$id: 'https://felt.social/vocab/read_files_response.json',
			type: 'object',
			properties: {
				files: {type: 'array', items: {$ref: 'File.json', tsType: 'File'}},
			},
			required: ['files'],
			additionalProperties: false,
		},
	},
	returns: 'Promise<ReadFilesResponseResult>',
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
	// TODO this is saying "use `read_files`'s params but for this event"
	// but it's verbose and awkward. If the pattern should stay, we could write a helper like:
	// `renameSchema(read_files.params.schema, 'https://felt.social/vocab/query_files_response.json')`
	// but that only handles extending the $id, which may not be the common case.
	params: {
		...read_files.params,
		schema: {
			...(read_files.params.schema as object),
			$id: 'https://felt.social/vocab/query_files_response.json',
		},
	},
	// TODO Can/should this compose the `read_files` event info?
	// Could make the `response` available.
	returns: 'Readable<Readable<File>[]>',
};

export const events: EventInfo[] = [create_file, read_files, query_files];
