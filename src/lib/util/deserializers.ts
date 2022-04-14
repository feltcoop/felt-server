// TODO BLOCK where does this belong? vocab utils?

// TODO BLOCK maybe combine with `deserializeProperties`?

export const deserializeDate = (v: string): Date => new Date(v);

export type Deserializers = Map<string, (v: any) => any>;

export const deserializers: Deserializers = new Map([
	['created', deserializeDate],
	['updated', deserializeDate],
]);
