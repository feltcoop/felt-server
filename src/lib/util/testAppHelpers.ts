import sourcemapSupport from 'source-map-support';
import {writable} from 'svelte/store';

import type {AppStores} from '$lib/ui/app';
import {toUi} from '$lib/ui/ui';
import {toHttpApiClient} from '$lib/ui/HttpApiClient';
import type {EventsParams, EventsResponse} from '$lib/ui/events';
import {toApi} from '$lib/ui/api';
import {findService} from '$lib/ui/services';
import type {ClientSession} from '$lib/session/clientSession';

sourcemapSupport.install({
	handleUncaughtExceptions: false,
});

export interface TestAppContext {
	app: AppStores;
}

export const setupApp =
	(fetch: typeof globalThis.fetch) =>
	async (context: TestAppContext): Promise<void> => {
		console.log('setup app!!!');
		const session = writable<ClientSession>({guest: true});
		const ui = toUi(session, false);
		const httpApiClient = toHttpApiClient<EventsParams, EventsResponse>(findService, fetch);
		// maybe lazy to get late binding to optoions?
		context.app = {
			ui,
			api: toApi(ui, httpApiClient),
			devmode: writable(false),
			socket: null as any, // TODO ?
		};
	};

export const teardownApp = async (context: TestAppContext): Promise<void> => {
	console.log('teardown app!!!');
	// const {app} = context;
	context.app = null!;
	// app.close();
};
