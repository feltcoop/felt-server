import type {ServiceEventInfo, ClientEventInfo} from '$lib/vocab/event/event';

export const SetSession: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'SetSession',
	params: {
		$id: '/schemas/SetSessionParams.json',
		type: 'object',
		properties: {
			session: {
				type: 'object',
				// TODO it'd be nice to have schema validation here,
				// but currently the `ClientSession` is a manually-synced type.
				// This would be good for security because the server could validate the data
				// returned from `loadClientSession`.
				tsType: 'ClientSession',
			},
		},
		required: ['session'],
		additionalProperties: false,
	},
	returns: 'void',
};

export const LoginAccount: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'LoginAccount',
	authenticate: false,
	params: {
		$id: '/schemas/LoginAccountParams.json',
		type: 'object',
		properties: {
			username: {type: 'string'},
			password: {type: 'string'},
		},
		required: ['username', 'password'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/LoginAccountResponse.json',
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
	websockets: false,
	params: {
		$id: '/schemas/LogoutAccountParams.json',
		type: 'null',
	},
	response: {
		$id: '/schemas/LogoutAccountResponse.json',
		type: 'null',
	},
	returns: 'Promise<LogoutAccountResponseResult>',
	route: {
		path: '/api/v1/logout',
		method: 'POST',
	},
};
