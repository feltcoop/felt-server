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
	paramsSchema: ReadFilesServiceParams,
	handle: async (server, params) => {
		const {db} = server;
		const find_files_result = await db.repos.file.filter_by_space(params.space_id as any); // TODO remove the typecast once this PR is rebased
		if (find_files_result.ok) {
			return {code: 200, data: {files: find_files_result.value}}; // TODO API types
		} else {
			console.log('[file_middleware] error searching for files');
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
	paramsSchema: CreateFileServiceParams,
	handle: async (server, params, _account_id) => {
		// TODO validate `account_id` against the persona -- maybe as an optimized standalone method?
		// server.db.repos.account.validate_persona(account_id, actor_id);
		const insert_files_result = await server.db.repos.file.create(
			params.actor_id,
			params.space_id,
			params.content,
		);
		if (insert_files_result.ok) {
			return {code: 200, data: {file: insert_files_result.value}}; // TODO API types
		} else {
			console.log('[file_middleware] error searching for files');
			return {code: 500, data: {reason: 'error searching for files'}};
		}
	},
};
