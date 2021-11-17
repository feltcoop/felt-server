import type {EventInfo, RemoteEventInfo} from '$lib/vocab/event/event';

// TODO should `session` be in `$lib/vocab` ?

const log_in_response_type = `{session: ClientAccountSession}`;
export const log_in: RemoteEventInfo = {
	type: 'RemoteEvent',
	name: 'log_in',
	params: {
		schema: {
			$id: 'https://felt.dev/vocab/log_in_params.json',
			type: 'object',
			properties: {
				accountName: {type: 'string'},
				password: {type: 'string'},
			},
			required: ['accountName', 'password'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${log_in_response_type}>`,
		schema: {
			$id: 'https://felt.dev/vocab/log_in_response.json',
			type: 'null',
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${log_in_response_type}>>`,
	// TODO refactor into a service and add `route`
};

const log_out_response_type = '{message: string}';
export const log_out: RemoteEventInfo = {
	type: 'RemoteEvent',
	name: 'log_out',
	params: {
		// TODO refactor into a service
		schema: null,
	},
	response: {
		type: `ApiResult<${log_out_response_type}>`,
		// TODO refactor into a service
		schema: {
			$id: 'https://felt.dev/vocab/log_out_response.json',
			type: 'object',
			properties: {
				message: {type: 'string'},
			},
			required: ['message'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${log_out_response_type}>>`,
	// TODO refactor into a service and add `route`
};

export const events: EventInfo[] = [log_in, log_out];
