import type {SchemaObject} from 'ajv';
import {compile, type Options} from '@ryanatkn/json-schema-to-typescript';

export const jsonSchemaToTypescript = (
	schema: SchemaObject | null,
	name: string,
	options?: Partial<Options> | undefined,
) => {
	if (schema && typeof schema === 'object') {
		return compile(schema, name, {bannerComment: '', format: false, ...options});
	} else {
		return `export type ${name} = void;`;
	}
};

export type JsonSchemaToTypeScriptOptions = Options;
