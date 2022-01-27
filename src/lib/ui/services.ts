import {parseServiceEventInfo} from '$lib/vocab/event/event';
import type {ServiceEventInfo} from '$lib/vocab/event/event';
import {eventInfoByName} from '$lib/app/events';

export const findHttpService = (name: string): ServiceEventInfo | undefined =>
	parseServiceEventInfo(eventInfoByName.get(name));

// TODO this should be part of the schema data, not hacked in like this
export const findWebsocketService = (name: string): ServiceEventInfo | undefined =>
	name === 'LoginAccount' ? undefined : parseServiceEventInfo(eventInfoByName.get(name));
