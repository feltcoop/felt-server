import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const LoginAccount: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'LoginAccount',
	authorize: false,
	params: {
		$id: 'https://felt.social/vocab/LoginAccountParams.json',
		type: 'object',
		properties: {
			username: {type: 'string'},
			password: {type: 'string'},
		},
		required: ['username', 'password'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/LoginAccountResponse.json',
		type: 'object',
		properties: {
			// TODO this wasn't being used ?
			// TODO session schema type
			// session: {$ref: 'Session.json', tsType: 'Persona'},
			session: {type: 'object', tsType: 'ClientAccountSession'},
		},
		required: ['session'],
		additionalProperties: false,
	},
	returns: 'Promise<LoginAccountResponseResult>',
	route: {
		path: '/api/v1/login',
		method: 'POST',
	},
};

export const LogoutAccount: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'LogoutAccount',
	// TODO hack because logout doesn't work via websockets,
	// maybe this should be a separate property like `websocket: false`?
	authorize: false,
	params: {
		$id: 'https://felt.social/vocab/LogoutAccountParams.json',
		type: 'null',
		tsType: 'void',
	},
	response: {
		$id: 'https://felt.social/vocab/LogoutAccountResponse.json',
		type: 'null',
	},
	returns: 'Promise<LogoutAccountResponseResult>',
	route: {
		path: '/api/v1/logout',
		method: 'POST',
	},
};

export const events: EventInfo[] = [LoginAccount, LogoutAccount];
