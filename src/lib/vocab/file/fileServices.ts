import {Type} from '@sinclair/typebox';

import type {Service} from '$lib/server/service';
import type {File} from '$lib/vocab/file/file';

const ReadFilesServiceParams = Type.Object(
	{
		space_id: Type.Number(),
	},
	{additionalProperties: false},
);

export const readFilesService: Service<typeof ReadFilesServiceParams, {files: File[]}> = {
	name: 'read_files',
	route: {
		path: '/api/v1/spaces/:space_id/files',
		method: 'get',
	},
	paramsSchema: ReadFilesServiceParams,
	handle: async (server, params) => {
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

// TODO FileParamsSchema ?
const CreateFileServiceParams = Type.Object(
	{
		actor_id: Type.Number(),
		space_id: Type.Number(),
		content: Type.String(),
	},
	{additionalProperties: false},
);

// TODO automatic params type and validation
// TODO should this use the `FileParams` type?
export const createFileService: Service<typeof CreateFileServiceParams, {file: File}> = {
	name: 'create_file',
	route: {
		path: '/api/v1/spaces/:space_id/files',
		method: 'post',
	},
	paramsSchema: CreateFileServiceParams,
	handle: async (server, params, _accountId) => {
		// TODO validate `account_id` against the persona -- maybe as an optimized standalone method?
		// server.db.repos.account.validatePersona(account_id, actor_id);
		const insertFilesResult = await server.db.repos.file.create(
			params.actor_id,
			params.space_id,
			params.content,
		);
		if (insertFilesResult.ok) {
			return {code: 200, data: {file: insertFilesResult.value}}; // TODO API types
		} else {
			console.log('[create_file] error searching for files');
			return {code: 500, data: {reason: 'error searching for files'}};
		}
	},
};
