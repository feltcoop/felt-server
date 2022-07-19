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

export const Login: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'Login',
	authenticate: false,
	params: {
		$id: '/schemas/LoginParams.json',
		type: 'object',
		properties: {
			username: {type: 'string'},
			password: {type: 'string'},
		},
		required: ['username', 'password'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/LoginResponse.json',
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
	returns: 'Promise<LoginResponseResult>',
	route: {
		path: '/api/v1/login',
		method: 'POST',
	},
};

export const Logout: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'Logout',
	websockets: false,
	params: {
		$id: '/schemas/LogoutParams.json',
		type: 'null',
	},
	response: {
		$id: '/schemas/LogoutResponse.json',
		type: 'null',
	},
	returns: 'Promise<LogoutResponseResult>',
	route: {
		path: '/api/v1/logout',
		method: 'POST',
	},
};
