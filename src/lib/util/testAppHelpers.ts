import {writable} from 'svelte/store';

import type {AppStores} from '$lib/ui/app';
import {toUi} from '$lib/ui/ui';
import {toHttpApiClient} from '$lib/ui/HttpApiClient';
import type {EventParamsByName, EventResponseByName} from '$lib/app/eventTypes';
import {toApi} from '$lib/ui/api';
import {findService} from '$lib/ui/services';
import type {ClientSession} from '$lib/session/clientSession';
import {installSourceMaps} from '$lib/util/testHelpers';

installSourceMaps();

export interface TestAppContext {
	app: AppStores;
}

export const setupApp =
	(fetch: typeof globalThis.fetch) =>
	async (context: TestAppContext): Promise<void> => {
		const session = writable<ClientSession>({guest: true});
		const ui = toUi(session, false);
		const httpApiClient = toHttpApiClient<EventParamsByName, EventResponseByName>(
			findService,
			fetch,
		);
		context.app = {
			ui,
			api: toApi(ui, httpApiClient),
			devmode: writable(false),
			// TODO refactor this so the socket isn't an app dependency,
			// instead the socket should only exist for the websocket client
			socket: null as any,
			contextmenu: null as any,
		};
	};

export const teardownApp = async (context: TestAppContext): Promise<void> => {
	context.app = null!;
	// currently doesn't need any explicit teardown:
	// context.app.close();
};
