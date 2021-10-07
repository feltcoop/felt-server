import {parseServiceEventInfo} from '$lib/vocab/event/event';
import type {ServiceEventInfo} from '$lib/vocab/event/event';
import {eventInfoByName} from '$lib/app/events';

export const findService = (name: string): ServiceEventInfo | undefined =>
	parseServiceEventInfo(eventInfoByName.get(name));
