// TODO not sure about this -- maybe these belong in another module, like ./persona.ts
// but  at the moment that imports `ajv`, and we need to worry about treeshaking it out
// (might be fine, but needs investigation before adding,
// because we don't want clients to import `ajv` unless needed)

export const GUEST_PERSONA_NAME = 'guest';

// TODO is this any url?
export const toUrl = (url: string | null | undefined): string =>
	url == null || url === '/' ? '' : url;
