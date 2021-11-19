import type {Service} from '$lib/server/service';
import type {PingParams, PingResponseResult} from '$lib/app/eventTypes';
import {ping} from '$lib/ui/ui.events';

export const pingService: Service<PingParams, PingResponseResult> = {
	event: ping,
	perform: async () => ({ok: true, status: 200, value: null}),
};
