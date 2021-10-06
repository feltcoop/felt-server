import type {EventInfo, RemoteEventInfo} from '$lib/vocab/event/event';

// TODO should `session` be in `$lib/vocab` ?

// TODO delete the `LoginRequest` type once this is used
const log_in_params_type = `{
  accountName: string;
  password: string;
}`;
export const log_in: RemoteEventInfo = {
	type: 'RemoteEvent',
	name: 'log_in',
	params: {
		type: log_in_params_type,
		schema: {
			$id: 'https://felt.social/vocab/log_in_params.json',
			type: 'object',
			properties: {
				accountName: {type: 'string'},
				password: {type: 'string'},
			},
			required: ['accountName', 'password'],
		},
	},
	response: {
		type: 'ApiResult<{session: ClientAccountSession}>',
		schema: {
			type: 'null',
		},
	},
	returns: 'Promise<ApiResult<{session: ClientAccountSession}>>',
	// TODO refactor into a service and add `route`
};

const log_out_response_type = 'ApiResult<void>';
export const log_out: RemoteEventInfo = {
	type: 'RemoteEvent',
	name: 'log_out',
	params: {
		type: 'void',
		// TODO refactor into a service
		schema: {},
	},
	response: {
		type: log_out_response_type,
		// TODO refactor into a service
		schema: {},
	},
	returns: `Promise<${log_out_response_type}>`,
	// TODO refactor into a service and add `route`
};

export const events: EventInfo[] = [log_in, log_out];
