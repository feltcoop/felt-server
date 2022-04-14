// TODO BLOCK where does this belong? vocab utils?

const deserializeDate = (v: string) => new Date(v);

export type Deserializers = Map<string, (v: any) => any>;

export const deserializers: Deserializers = new Map([
	['created', deserializeDate],
	['updated', deserializeDate],
]);
