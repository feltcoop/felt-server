import type {Service} from '$lib/server/service';
import {toValidateSchema} from '$lib/util/ajv';
import type {
	create_file_params_type,
	create_file_response_type,
	read_files_params_type,
	read_files_response_type,
} from '$lib/ui/events';
import {read_files, create_file} from '$lib/vocab/file/file.events';

// TODO rename to `getFiles`? `loadFiles`?
export const readFilesService: Service<read_files_params_type, read_files_response_type> = {
	name: 'read_files',
	route: {
		path: '/api/v1/spaces/:space_id/files',
		method: 'GET',
	},
	paramsSchema: read_files.params.schema!,
	validateParams: toValidateSchema(read_files.params.schema!),
	responseSchema: read_files.response.schema!,
	validateResponse: toValidateSchema(read_files.response.schema!),
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

// TODO should this use the `FileParams` type?
export const createFileService: Service<create_file_params_type, create_file_response_type> = {
	name: 'create_file',
	route: {
		path: '/api/v1/spaces/:space_id/files',
		method: 'POST',
	},
	paramsSchema: create_file.params.schema!,
	validateParams: toValidateSchema(create_file.params.schema!),
	responseSchema: create_file.response.schema!,
	validateResponse: toValidateSchema(create_file.response.schema!),
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
