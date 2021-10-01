import {parseServiceEventInfo} from '$lib/vocab/event/event';
import type {ServiceEventInfo} from '$lib/vocab/event/event';
import {eventInfoByName} from '$lib/vocab/event/eventsInfo';

// This is a client-friendly module that exposes the services metadata,
// excluding their server-side implementation and dependencies.

export const findService = (name: string): ServiceEventInfo | undefined =>
	parseServiceEventInfo(eventInfoByName.get(name));
