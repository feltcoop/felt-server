import {parseServiceEventInfo} from '$lib/vocab/event/event';
import type {ServiceEventInfo} from '$lib/vocab/event/event';
import {eventInfoByName} from '$lib/app/events';

export const findHttpService = (name: string): ServiceEventInfo | undefined =>
	parseServiceEventInfo(eventInfoByName.get(name));

// Websocket services include all of the http services except those that require authorization,
// because our server currently disallows unauthenticated websocket connections.
export const findWebsocketService = (name: string): ServiceEventInfo | undefined => {
	const serviceEventInfo = parseServiceEventInfo(eventInfoByName.get(name));
	if (!serviceEventInfo) return undefined;
	return serviceEventInfo.authenticate === false || serviceEventInfo.websockets === false
		? undefined
		: serviceEventInfo;
};
