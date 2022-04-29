import type {VocabSchema} from '@feltcoop/gro/dist/utils/schema.js';

import type {ServiceMethod} from '$lib/server/service';
import type {ClientEventName, ServiceEventName} from '$lib/app/eventTypes';

export type EventInfo = ClientEventInfo | ServiceEventInfo;

export interface ClientEventInfo {
	type: 'ClientEvent';
	name: ClientEventName;
	// TODO we want to enforce schemas so we can generate params forms and automatic randomizers
	params: VocabSchema | null;
	returns: string;
}

// Service events are handled by a remote `Service` (`$lib/server/service.ts`).
// Their `route` property enables url route building for http methods.
export interface ServiceEventInfo {
	type: 'ServiceEvent';
	name: ServiceEventName;
	authenticate?: boolean; // `true` by default -- does this service require login?
	websockets?: boolean; // `true` by default -- can this service be called via websockets?
	broadcast?: boolean; // `false` by default -- does this service event rebroadcast to other community clients
	params: VocabSchema;
	response: VocabSchema;
	returns: string;
	// `ServiceEvent`s have a `route` for http clients; websocket clients only need the event `name`
	route: {
		path: string; // e.g. '/api/v1/some/:neat/:path'
		method: ServiceMethod; // supports each `trouter` http method: https://github.com/lukeed/trouter#method
	};
}

export const parseServiceEventInfo = (
	eventInfo: EventInfo | undefined,
): ServiceEventInfo | undefined => (eventInfo?.type === 'ServiceEvent' ? eventInfo : undefined);
