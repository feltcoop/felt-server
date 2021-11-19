import type {Service} from '$lib/server/service';
import type {ping_params_type, ping_response_type} from '$lib/ui/events';
import {ping} from '$lib/ui/ui.events';

export const pingService: Service<ping_params_type, ping_response_type> = {
	event: ping,
	perform: async () => ({ok: true, status: 200, value: null}),
};
