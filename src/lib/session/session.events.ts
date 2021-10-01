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
		schema: null, // TODO refactor into a service
	},
	response: {
		type: 'ApiResult<{session: ClientAccountSession}>',
		schema: null, // TODO refactor into a service
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
		schema: null, // TODO refactor into a service
	},
	response: {
		type: log_out_response_type,
		schema: null, // TODO refactor into a service
	},
	returns: `Promise<${log_out_response_type}>`,
	// TODO refactor into a service and add `route`
};

export const events: EventInfo[] = [log_in, log_out];
