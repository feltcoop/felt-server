import type {EventInfo, RemoteEventInfo} from '$lib/vocab/event/event';

// TODO should `session` be in `$lib/vocab` ?

// TODO delete the `LoginRequest` type once this is used
const log_in_params_type = `{
  accountName: string;
  password: string;
}`;
const log_in_response_type = `{session: ClientAccountSession}`;
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
		type: `ApiResult<${log_in_response_type}>`,
		schema: {
			$id: 'https://felt.social/vocab/log_in_response.json',
			type: 'null',
		},
	},
	returns: `Promise<ApiResult<${log_in_response_type}>>`,
	// TODO refactor into a service and add `route`
};

const log_out_params_type = 'void';
const log_out_response_type = '{message: string}';
export const log_out: RemoteEventInfo = {
	type: 'RemoteEvent',
	name: 'log_out',
	params: {
		type: log_out_params_type,
		// TODO refactor into a service
		schema: {
			$id: 'https://felt.social/vocab/log_out_params.json',
			type: 'null',
		},
	},
	response: {
		type: `ApiResult<${log_out_response_type}>`,
		// TODO refactor into a service
		schema: {
			$id: 'https://felt.social/vocab/log_out_response.json',
			type: 'object',
			properties: {
				message: {type: 'string'},
			},
			required: ['message'],
		},
	},
	returns: `Promise<ApiResult<${log_out_response_type}>>`,
	// TODO refactor into a service and add `route`
};

export const events: EventInfo[] = [log_in, log_out];
