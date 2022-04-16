import {traverse} from '@feltcoop/felt/util/object.js';

// TODO where does this belong? vocab utils?

export interface Deserialize {
	(value: any): void;
}

export const deserialize =
	(deserializers: Deserializers): Deserialize =>
	(value) => {
		traverse(value, (key, value, obj) => {
			if (deserializers.has(key)) {
				obj[key] = deserializers.get(key)!(value);
			}
		});
	};

export const deserializeDate = (v: string): Date => new Date(v);

export interface Deserializer<TInput = any, TOutput = any> {
	(v: TInput): TOutput;
}

export type Deserializers = Map<string, Deserializer>;

export const deserializers: Deserializers = new Map([
	['created', deserializeDate],
	['updated', deserializeDate],
]);
