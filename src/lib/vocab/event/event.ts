import type {AnySchema} from 'ajv';

import type {ServiceMethod} from '$lib/server/service';

export type EventInfo = ClientEventInfo | ServiceEventInfo | RemoteEventInfo;

export interface ClientEventInfo {
	type: 'ClientEvent';
	name: string; // `snake_cased`
	params: {
		type: string;
		schema: AnySchema | null;
	};
	returns: string;
}

export interface ServiceEventInfo {
	type: 'ServiceEvent';
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

// TODO remote events are a hack around
export interface RemoteEventInfo {
	type: 'RemoteEvent';
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

export const parseServiceEventInfo = (
	eventInfo: EventInfo | undefined,
): ServiceEventInfo | undefined => (eventInfo?.type === 'ServiceEvent' ? eventInfo : undefined);
