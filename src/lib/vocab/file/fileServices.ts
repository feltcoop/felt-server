import {Type} from '@sinclair/typebox';

import type {Service} from '$lib/server/service';
import {FileSchema} from '$lib/vocab/file/file';
import {toValidateSchema} from '$lib/util/ajv';

const ReadFilesServiceParams = Type.Object(
	{
		space_id: Type.Number(),
	},
	{$id: 'ReadFilesServiceParams', additionalProperties: false},
);
const ReadFilesServiceResponse = Type.Object(
	{
		files: Type.Array(FileSchema),
	},
	{$id: 'ReadFilesServiceResponse', additionalProperties: false},
);

// TODO rename to `getFiles`? `loadFiles`?
export const readFilesService: Service<
	typeof ReadFilesServiceParams,
	typeof ReadFilesServiceResponse
> = {
	name: 'read_files',
	route: {
		path: '/api/v1/spaces/:space_id/files',
		method: 'GET',
	},
	paramsSchema: ReadFilesServiceParams,
	validateParams: toValidateSchema(ReadFilesServiceParams),
	responseSchema: ReadFilesServiceResponse,
	validateResponse: toValidateSchema(ReadFilesServiceResponse),
	perform: async ({server, params}) => {
		const {db} = server;
		const findFilesResult = await db.repos.file.filterBySpace(params.space_id);
		if (findFilesResult.ok) {
			return {ok: true, status: 200, value: {files: findFilesResult.value}}; // TODO API types
		} else {
			console.log('[read_files] error searching for files');
			return {ok: false, status: 500, reason: 'error searching for files'};
		}
	},
};

// TODO FileParamsSchema ? compose `FileParams`?
const CreateFileServiceParams = Type.Object(
	{
		actor_id: Type.Number(),
		space_id: Type.Number(),
		content: Type.String(),
	},
	{$id: 'CreateFileServiceParams', additionalProperties: false},
);
const CreateFileServiceResponse = Type.Object(
	{
		file: FileSchema,
	},
	{$id: 'CreateFileServiceResponse', additionalProperties: false},
);

// TODO automatic params type and validation
// TODO should this use the `FileParams` type?
export const createFileService: Service<
	typeof CreateFileServiceParams,
	typeof CreateFileServiceResponse
> = {
	name: 'create_file',
	route: {
		path: '/api/v1/spaces/:space_id/files',
		method: 'POST',
	},
	paramsSchema: CreateFileServiceParams,
	validateParams: toValidateSchema(CreateFileServiceParams),
	responseSchema: CreateFileServiceResponse,
	validateResponse: toValidateSchema(CreateFileServiceResponse),
	perform: async ({server, params}) => {
		// TODO security: validate `account_id` against the persona -- maybe as an optimized standalone method?
		// server.db.repos.account.validatePersona(account_id, actor_id);
		const insertFilesResult = await server.db.repos.file.create(params);
		if (insertFilesResult.ok) {
			return {ok: true, status: 200, value: {file: insertFilesResult.value}}; // TODO API types
		} else {
			console.log('[create_file] error searching for files');
			return {ok: false, status: 500, reason: 'error searching for files'};
		}
	},
};
