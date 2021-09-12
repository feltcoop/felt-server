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

export const readFilesService: Service<
	typeof ReadFilesServiceParams,
	typeof ReadFilesServiceResponse
> = {
	name: 'read_files',
	paramsSchema: ReadFilesServiceParams,
	validateParams: toValidateSchema(ReadFilesServiceParams),
	responseSchema: ReadFilesServiceResponse,
	validateResponse: toValidateSchema(ReadFilesServiceResponse),
	perform: async (server, params) => {
		const {db} = server;
		const findFilesResult = await db.repos.file.filterBySpace(params.space_id as any); // TODO remove the typecast once this PR is rebased
		if (findFilesResult.ok) {
			return {code: 200, data: {files: findFilesResult.value}}; // TODO API types
		} else {
			console.log('[read_files] error searching for files');
			return {code: 500, data: {reason: 'error searching for files'}};
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
	paramsSchema: CreateFileServiceParams,
	validateParams: toValidateSchema(CreateFileServiceParams),
	responseSchema: CreateFileServiceResponse,
	validateResponse: toValidateSchema(CreateFileServiceParams),
	perform: async (server, params, _accountId) => {
		// TODO validate `account_id` against the persona -- maybe as an optimized standalone method?
		// server.db.repos.account.validatePersona(account_id, actor_id);
		const insertFilesResult = await server.db.repos.file.create(params);
		if (insertFilesResult.ok) {
			return {code: 200, data: {file: insertFilesResult.value}}; // TODO API types
		} else {
			console.log('[create_file] error searching for files');
			return {code: 500, data: {reason: 'error searching for files'}};
		}
	},
};
