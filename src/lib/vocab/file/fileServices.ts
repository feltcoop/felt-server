import type {Service} from '$lib/server/service';
import type {
	CreateFileParams,
	CreateFileResponseResult,
	ReadFilesParams,
	ReadFilesResponseResult,
} from '$lib/app/eventTypes';
import {read_files, create_file} from '$lib/vocab/file/file.events';

// TODO rename to `getFiles`? `loadFiles`?
export const readFilesService: Service<ReadFilesParams, ReadFilesResponseResult> = {
	event: read_files,
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

export const createFileService: Service<CreateFileParams, CreateFileResponseResult> = {
	event: create_file,
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
