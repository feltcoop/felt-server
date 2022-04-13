import {traverse} from '@feltcoop/felt/util/object.js';

// TODO BLOCK where does this belong? vocab utils?

// TODO BLOCK handle arrays better -- maybe use Symbol.iterator detection and `for..of` in `traverse`

const toDate = (v: string) => new Date(v);

export type Deserializers = Map<string, (v: any) => any>;

// TODO BLOCK how to use this? pass as param to `deserializeProperties`?
const deserializers: Deserializers = new Map([
	['created', toDate],
	['updated', toDate],
]);

export const deserializeProperties = (value: any): void => {
	traverse(value, (key, value, obj) => {
		// TODO do we need to use the inverse of this before `JSON.stringify` to support custom serialization? so far no!
		if (deserializers.has(key)) {
			obj[key] = deserializers.get(key)!(value);
		}
	});
};
