import {traverse} from '@feltcoop/felt/util/object.js';

// TODO where does this belong? vocab utils?

export const deserializeDate = (v: string): Date => new Date(v);

export type Deserializers = Map<string, (v: any) => any>;

export const deserializers: Deserializers = new Map([
	['created', deserializeDate],
	['updated', deserializeDate],
]);

export interface DeserializeProperties {
	(value: any): void;
}

export const deserialize =
	(deserializers: Deserializers): DeserializeProperties =>
	(value) => {
		traverse(value, (key, value, obj) => {
			if (deserializers.has(key)) {
				obj[key] = deserializers.get(key)!(value);
			}
		});
	};
