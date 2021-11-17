import type {SchemaObject} from 'ajv';
import {compile, Options} from '@ryanatkn/json-schema-to-typescript';

export const jsonSchemaToTypescript = (
	schema: SchemaObject | null,
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
export const toTypeName = (name: string): string =>
	name
		.split('_')
		.map((s) => s[0].toUpperCase() + s.substring(1))
		.join('');
