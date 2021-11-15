import {compile} from 'json-schema-to-typescript';

export const jsonSchemaToTypescript: typeof compile = (schema, name, options) =>
	compile(schema, name, {bannerComment: '', format: false, ...options});
