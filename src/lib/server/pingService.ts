import type {Service} from '$lib/server/service';
import type {PingParams, PingResponseResult} from '$lib/app/eventTypes';
import {ping} from '$lib/ui/ui.events';

// TODO maybe move this module?
// Possibly to `$lib/server/serverServices.ts` or a new dir
// at `$lib/server/services/pingService.ts` or `$lib/server/services/ping.ts`

export const pingService: Service<PingParams, PingResponseResult> = {
	event: ping,
	perform: async () => ({ok: true, status: 200, value: null}),
};
