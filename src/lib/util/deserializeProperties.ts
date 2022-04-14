import {traverse} from '@feltcoop/felt/util/object.js';

import type {Deserializers} from '$lib/util/deserializers';

// TODO BLOCK where does this belong? vocab utils?

export interface DeserializeProperties {
	(value: any): void;
}

export const deserializeProperties =
	(deserializers: Deserializers): DeserializeProperties =>
	(value) => {
		traverse(value, (key, value, obj) => {
			if (deserializers.has(key)) {
				obj[key] = deserializers.get(key)!(value);
			}
		});
	};
