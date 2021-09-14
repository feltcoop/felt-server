import type {Gen} from '@feltcoop/gro/dist/gen/gen.js';

import * as config from '$lib/config';

export const gen: Gen = async () => {
	return JSON.stringify(config);
};
