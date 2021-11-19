import type {Service} from '$lib/server/service';
import type {PingParams, PingResponse} from '$lib/app/eventTypes';
import {ping} from '$lib/ui/ui.events';

export const pingService: Service<PingParams, PingResponse> = {
	event: ping,
	perform: async () => ({ok: true, status: 200, value: null}),
};
