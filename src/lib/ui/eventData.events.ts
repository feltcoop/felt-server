import type {AnySchema} from 'ajv';

import type {ServiceMethod} from '$lib/server/service';

// TODO consider this `.events.` pattern,
// e.g. `$lib/vocab/community/community.events.ts`
// and `$lib/ui/ui.events.ts`
// to break it into many modules across the project's directories --
// maybe `gro gen` could automate some of the work for this usecase and similar
// with configurable extension behavior.
// (in this case, we want to aggregate all events across all `.events.` modules)

interface EventData {
	name: string;
	params: {
		type: string;
		schema: AnySchema | null;
	};
	response: {
		type: string;
		schema: AnySchema | null;
	};
	returns: string;
	route?: {
		path: string;
		method: ServiceMethod;
	};
}

// TODO generate the type from the schema with json-schema-to-typescript
const create_community_params_type = '{name: string; persona_id: number}';
const create_community_response_type = '{community: Community}'; // TODO declrs?
const create_community: EventData = {
	name: 'create_community',
	params: {
		type: create_community_params_type,
		schema: {
			$id: 'create_community_params',
			properties: {
				name: {type: 'string'},
				persona_id: {type: 'number'},
			},
			required: ['name', 'persona_id'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${create_community_response_type}>`,
		schema: {
			$id: 'create_community_response',
			properties: {
				community: {$ref: '#/$defs/community'},
			},
			required: ['community'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${create_community_response_type}>>`,
	route: {
		path: '/api/v1/communities',
		method: 'POST',
	},
};

const create_persona_params_type = '{name: string}';
const create_persona_response_type = '{persona: Persona; community: Community}';
const create_persona: EventData = {
	name: 'create_persona',
	params: {
		type: create_persona_params_type,
		schema: {
			$id: 'create_persona_response',
			properties: {
				name: {type: 'string'},
			},
			required: ['name'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${create_persona_response_type}>`,
		schema: {
			$id: 'create_persona_response',
			properties: {
				persona: {$ref: '#/$defs/persona'},
				community: {$ref: '#/$defs/community'},
			},
			required: ['persona', 'community'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${create_persona_response_type}>>`,
	route: {
		path: '/api/v1/personas',
		method: 'POST',
	},
};

const create_membership_params_type = '{persona_id: number; community_id: number}';
const create_membership_response_type = '{membership: Membership}';
const create_membership: EventData = {
	name: 'create_membership',
	params: {
		type: create_membership_params_type,
		schema: {
			$id: 'create_membership_response',
			properties: {
				persona_id: {type: 'number'},
				community_id: {type: 'number'},
			},
			required: ['persona_id', 'community_id'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${create_membership_response_type}>`,
		schema: {
			$id: 'create_membership_response',
			properties: {
				membership: {$ref: '#/$defs/membership'},
			},
			required: ['membership'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${create_membership_response_type}>>`,
	route: {
		path: '/api/v1/memberships',
		method: 'POST',
	},
};

const create_space_params_type = `{
	community_id: number;
	name: string;
	url: string;
	media_type: string;
	content: string;
}`;
const create_space_response_type = '{space: Space}';
const create_space: EventData = {
	name: 'create_space',
	params: {
		type: create_space_params_type,
		schema: {
			$id: 'create_space_response',
			properties: {
				community_id: {type: 'number'},
				name: {type: 'string'},
				url: {type: 'string'},
				media_type: {type: 'string'},
				content: {type: 'string'},
			},
			required: ['community_id', 'name', 'url', 'media_type', 'content'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${create_space_response_type}>`,
		schema: {
			$id: 'create_space_response',
			properties: {
				space: {$ref: '#/$defs/space'},
			},
			required: ['space'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${create_space_response_type}>>`,
	route: {
		path: '/api/v1/communities/:community_id/spaces',
		method: 'POST',
	},
};

const create_file_params_type = `{
	actor_id: number;
	space_id: number;
	content: string;
}`;
const create_file_response_type = '{file: File}';
const create_file: EventData = {
	name: 'create_file',
	params: {
		type: create_file_params_type,
		schema: {
			$id: 'create_file_response',
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
const read_files: EventData = {
	name: 'read_files',
	params: {
		type: read_files_params_type,
		schema: {
			$id: 'read_files_response',
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
				files: {type: 'array', items: {$ref: '#/$defs/persona'}},
			},
			required: ['persona', 'community'],
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
const query_files = {
	name: 'query_files',
	params: read_files.params,
	response: {
		type: 'void',
		schema: null,
	},
	returns: 'Readable<Readable<File>[]>',
};

export const events: EventData[] = [
	{
		name: 'log_in',
		params: {
			type: 'LoginRequest',
			schema: null,
		},
		response: {
			type: 'ApiResult<{session: ClientAccountSession}>',
			schema: null,
		},
		returns: 'Promise<ApiResult<{session: ClientAccountSession}>>',
	},
	{
		name: 'log_out',
		params: {
			type: 'void',
			schema: null,
		},
		response: {
			type: 'ApiResult<void>',
			schema: null,
		},
		returns: 'Promise<ApiResult<void>>',
	},
	create_community,
	create_persona,
	create_membership,
	create_space,
	create_file,
	read_files,
	query_files,
	{
		name: 'toggle_main_nav',
		params: {
			type: 'void',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		name: 'toggle_secondary_nav',
		params: {
			type: 'void',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		name: 'set_main_nav_view',
		params: {
			type: 'MainNavView',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		name: 'set_mobile',
		params: {
			type: 'boolean',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		name: 'select_persona',
		params: {
			type: '{persona_id: number}',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		name: 'select_community',
		params: {
			type: '{community_id: number | null}',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
	{
		name: 'select_space',
		params: {
			type: '{community_id: number, space_id: number}',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'void',
	},
];
