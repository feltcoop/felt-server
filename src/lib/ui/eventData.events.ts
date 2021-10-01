import type {AnySchema} from 'ajv';

import type {ServiceMethod} from '$lib/server/service';

// TODO consider this `.events.` pattern
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
		// TODO does `response` belong with the other `route` properties?
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
		type: create_persona_response_type,
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
	{
		name: 'create_membership',
		params: {
			type: 'Static<typeof createMembershipService.paramsSchema>',
			schema: null,
		},
		response: {
			type: 'ApiResult<Static<typeof createMembershipService.responseSchema>>',
			schema: null,
		},
		returns: 'Promise<ApiResult<Static<typeof createMembershipService.responseSchema>>>',
	},
	{
		name: 'create_space',
		params: {
			type: 'Static<typeof createSpaceService.paramsSchema>',
			schema: null,
		},
		response: {
			type: 'ApiResult<Static<typeof createSpaceService.responseSchema>>',
			schema: null,
		},
		returns: 'Promise<ApiResult<Static<typeof createSpaceService.responseSchema>>>',
	},
	{
		name: 'create_file',
		params: {
			type: 'Static<typeof createFileService.paramsSchema>',
			schema: null,
		},
		response: {
			type: 'ApiResult<Static<typeof createFileService.responseSchema>>',
			schema: null,
		},
		returns: 'Promise<ApiResult<Static<typeof createFileService.responseSchema>>>',
	},
	{
		name: 'read_files',
		params: {
			type: 'Static<typeof readFilesService.paramsSchema>',
			schema: null,
		},
		response: {
			type: 'ApiResult<Static<typeof readFilesService.responseSchema>>',
			schema: null,
		},
		returns: 'Promise<ApiResult<Static<typeof readFilesService.responseSchema>>>',
	},
	// `query_files` differs from `read_files` in that
	// it returns a reactive store containing the requested files.
	// Its API could be expanded to give callers access to its async status or promise,
	// maybe via a third `options` arg with callbacks.
	{
		name: 'query_files',
		params: {
			type: 'Static<typeof readFilesService.paramsSchema>',
			schema: null,
		},
		response: {
			type: 'void',
			schema: null,
		},
		returns: 'Readable<Readable<File>[]>',
	},
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
