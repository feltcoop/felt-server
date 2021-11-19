import type {SchemaObject} from 'ajv';

import type {ServiceMethod} from '$lib/server/service';

export type EventInfo = ClientEventInfo | ServiceEventInfo | RemoteEventInfo;

export interface ClientEventInfo {
	type: 'ClientEvent';
	name: string; // `snake_cased`
	// TODO we want to enforce schemas so we can generate params forms and automatic randomizers
	params: SchemaObject | null;
	returns: string;
}

// Service events are handled by a remote `Service` (`$lib/server/service.ts`).
// Their `route` property enables url route building for http methods.
export interface ServiceEventInfo {
	type: 'ServiceEvent';
	name: string; // `snake_cased`
	params: SchemaObject;
	response: SchemaObject;
	returns: string;
	// `ServiceEvent`s have a `route` for http clients; websocket clients only need the event `name`
	route: {
		path: string; // e.g. '/api/v1/some/:neat/:path'
		method: ServiceMethod; // supports each `trouter` http method: https://github.com/lukeed/trouter#method
	};
}

// Remote events are external API calls that aren't services.
export interface RemoteEventInfo {
	type: 'RemoteEvent';
	name: string; // `snake_cased`
	params: SchemaObject | null;
	response: SchemaObject;
	returns: string;
	// unlike services, these have no `route`
}

export const parseServiceEventInfo = (
	eventInfo: EventInfo | undefined,
): ServiceEventInfo | undefined => (eventInfo?.type === 'ServiceEvent' ? eventInfo : undefined);
