import type {ServiceByName} from '$lib/app/eventTypes';
import {Ping} from '$lib/ui/uiEvents';

// TODO maybe move this module?
// Possibly to `$lib/server/serverServices.ts` or a new dir
// at `$lib/server/services/pingService.ts` or `$lib/server/services/ping.ts`

export const PingService: ServiceByName['Ping'] = {
	event: Ping,
	perform: async () => ({ok: true, status: 200, value: null}),
};
