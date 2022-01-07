import type {EventInfo, RemoteEventInfo} from '$lib/vocab/event/event';

// TODO should `session` be in `$lib/vocab` ?

export const LogIn: RemoteEventInfo = {
	type: 'RemoteEvent',
	name: 'LogIn',
	params: {
		$id: 'https://felt.social/vocab/LogInParams.json',
		type: 'object',
		properties: {
			accountName: {type: 'string'},
			password: {type: 'string'},
		},
		required: ['accountName', 'password'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/LogInResponse.json',
		type: 'null',
	},
	returns: 'Promise<ApiResult<{session: ClientAccountSession}>>',
	// TODO refactor into a service and add `route`
};

export const LogOut: RemoteEventInfo = {
	type: 'RemoteEvent',
	name: 'LogOut',
	params: null,
	response: {
		$id: 'https://felt.social/vocab/LogOutResponse.json',
		type: 'object',
		properties: {
			message: {type: 'string'},
		},
		required: ['message'],
		additionalProperties: false,
	},
	returns: 'Promise<LogOutResponseResult>',
	// TODO refactor into a service and add `route`
};

export const events: EventInfo[] = [LogIn, LogOut];
