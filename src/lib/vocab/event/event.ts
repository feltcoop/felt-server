import type {AnySchema} from 'ajv';

import type {ServiceMethod} from '$lib/server/service';

export type EventInfo = ClientEventInfo | ServiceEventInfo;

// TODO instead of this consider a property on each?
// `type: "ServiceEvent"` `type: "ClientEvent"`

export interface ClientEventInfo {
	name: string; // `snake_cased`
	params: {
		type: string;
		schema: AnySchema | null;
	};
	response: {
		type: string;
		schema: AnySchema | null;
	};
	returns: string;
}

export interface ServiceEventInfo {
	name: string; // `snake_cased`
	params: {
		type: string;
		schema: AnySchema;
	};
	response: {
		type: string;
		schema: AnySchema;
	};
	returns: string;
	// for services
	route: {
		path: string; // e.g. '/api/v1/some/:neat/:path'
		method: ServiceMethod; // supports each `trouter` http method: https://github.com/lukeed/trouter#method
	};
}

export const parseServiceEventInfo = (eventInfo: any): ServiceEventInfo | undefined =>
	eventInfo?.route ? eventInfo : undefined;
