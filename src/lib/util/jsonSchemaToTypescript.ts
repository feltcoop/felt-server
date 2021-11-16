import type {AnySchema} from 'ajv';
import {compile, Options} from 'json-schema-to-typescript';

export const jsonSchemaToTypescript = (
	schema: AnySchema | null,
	name: string,
	options?: Partial<Options> | undefined,
) => {
	if (schema && typeof schema === 'object') {
		return compile(schema, name, {bannerComment: '', format: false, ...options});
	} else {
		return `export type ${toTypeName(name)} = void;`;
	}
};

// some_event_type => SomeEventType
const toTypeName = (name: string): string =>
	name.split('_').reduce((acc, part) => acc + part[0].toUpperCase() + part.substring(1), '');
