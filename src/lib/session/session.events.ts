import type {EventInfo, RemoteEventInfo} from '$lib/vocab/event/event';

// TODO should `session` be in `$lib/vocab` ?

const LogInResponseResult = `{session: ClientAccountSession}`;
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
		type: `ApiResult<${LogInResponseResult}>`,
		schema: {
			$id: 'https://felt.dev/vocab/log_in_response.json',
			type: 'null',
		},
	},
	returns: `Promise<ApiResult<${LogInResponseResult}>>`,
	// TODO refactor into a service and add `route`
};

const LogOutResponseResult = '{message: string}';
export const log_out: RemoteEventInfo = {
	type: 'RemoteEvent',
	name: 'log_out',
	params: {
		// TODO refactor into a service
		schema: null,
	},
	response: {
		type: `ApiResult<${LogOutResponseResult}>`,
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
	returns: `Promise<ApiResult<${LogOutResponseResult}>>`,
	// TODO refactor into a service and add `route`
};

export const events: EventInfo[] = [log_in, log_out];
