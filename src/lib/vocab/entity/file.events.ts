import type {EventInfo, ClientEventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateFile: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateFile',
	params: {
		$id: 'https://felt.social/vocab/CreateFileParams.json',
		type: 'object',
		properties: {
			actor_id: {type: 'number'},
			space_id: {type: 'number'},
			content: {type: 'string'},
		},
		required: ['actor_id', 'space_id', 'content'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/CreateFileResponse.json',
		type: 'object',
		properties: {
			file: {$ref: 'File.json', tsType: 'File'},
		},
		required: ['file'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateFileResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id/files',
		method: 'POST',
	},
};

export const ReadFiles: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadFiles',
	params: {
		$id: 'https://felt.social/vocab/ReadFilesParams.json',
		type: 'object',
		properties: {
			space_id: {type: 'number'},
		},
		required: ['space_id'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/ReadFilesResponse.json',
		type: 'object',
		properties: {
			files: {type: 'array', items: {$ref: 'File.json', tsType: 'File'}},
		},
		required: ['files'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadFilesResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id/files',
		method: 'GET',
	},
};

// `QueryFiles` differs from `ReadFiles` in that
// it returns a reactive store containing the requested files.
// Its API could be expanded to give callers access to its async status or promise,
// maybe via a third `options` arg with callbacks.
export const QueryFiles: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'QueryFiles',
	// TODO this is saying "use `ReadFiles`'s params but for this event"
	// but it's verbose and awkward. If the pattern should stay, we could write a helper like:
	// `renameSchema(ReadFiles.params, 'https://felt.social/vocab/QueryFilesResponse.json')`
	// but that only handles extending the $id, which may not be the common case.
	params: {
		...ReadFiles.params,
		$id: 'https://felt.social/vocab/QueryFilesResponse.json',
	},
	// TODO Can/should this compose the `ReadFiles` event info?
	// Could make the `response` available.
	returns: 'Readable<Readable<File>[]>',
};

export const events: EventInfo[] = [CreateFile, ReadFiles, QueryFiles];
