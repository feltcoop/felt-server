import type {EventInfo, RemoteEventInfo} from '$lib/vocab/event/event';

// TODO should `session` be in `$lib/vocab` ?

export const LogIn: RemoteEventInfo = {
	type: 'RemoteEvent',
	name: 'LogIn',
	params: {
		$id: '/schemas/LogInParams.json',
		type: 'object',
		properties: {
			accountName: {type: 'string'},
			password: {type: 'string'},
		},
		required: ['accountName', 'password'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/LogInResponse.json',
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
		$id: '/schemas/LogOutResponse.json',
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
