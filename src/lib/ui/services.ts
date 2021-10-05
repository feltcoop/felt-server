import {parseServiceEventInfo} from '$lib/vocab/event/event';
import type {ServiceEventInfo} from '$lib/vocab/event/event';
import {eventByName} from '$lib/vocab/events';

export const findService = (name: string): ServiceEventInfo | undefined =>
	parseServiceEventInfo(eventByName.get(name));
