import {writable} from '@feltcoop/svelte-gettable-stores';

import type {AppStores} from '$lib/ui/app';
import {toUi} from '$lib/ui/ui';
import {toHttpApiClient} from '$lib/ui/HttpApiClient';
import type {EventParamsByName, EventResponseByName} from '$lib/app/eventTypes';
import {toDispatch} from '$lib/app/dispatch';
import {findHttpService} from '$lib/ui/services';
import {installSourceMaps} from '$lib/util/testHelpers';
import {mutations} from '$lib/app/mutations';
import {deserialize, deserializers} from '$lib/util/deserialize';

installSourceMaps();

export interface TestAppContext {
	app: AppStores;
}

export const setupApp =
	(fetch: typeof globalThis.fetch) =>
	async (context: TestAppContext): Promise<void> => {
		const session = writable<ClientSession>({guest: true});
		const ui = toUi(session, false, {});
		const httpApiClient = toHttpApiClient<EventParamsByName, EventResponseByName>(
			findHttpService,
			deserialize(deserializers),
			fetch,
		);
		context.app = {
			ui,
			dispatch: toDispatch(ui, mutations, () => httpApiClient),
			devmode: writable(false),
			// TODO refactor this so the socket isn't an app dependency,
			// instead the socket should only exist for the websocket client
			socket: null as any,
		};
	};

export const teardownApp = async (context: TestAppContext): Promise<void> => {
	context.app = null!;
	// currently doesn't need any explicit teardown:
	// context.app.close();
};
