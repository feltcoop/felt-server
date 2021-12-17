import type {Service} from '$lib/server/service';
import type {
	CreateEntityParams,
	CreateEntityResponseResult,
	ReadEntitiesParams,
	ReadEntitiesResponseResult,
} from '$lib/app/eventTypes';
import {ReadEntities, CreateEntity} from '$lib/vocab/entity/entity.events';

// TODO rename to `getFiles`? `loadFiles`?
export const readFilesService: Service<ReadEntitiesParams, ReadEntitiesResponseResult> = {
	event: ReadEntities,
	perform: async ({server, params}) => {
		const {db} = server;
		const findFilesResult = await db.repos.entity.filterBySpace(params.space_id);
		if (findFilesResult.ok) {
			return {ok: true, status: 200, value: {files: findFilesResult.value}}; // TODO API types
		} else {
			console.log('[ReadEntities] error searching for files');
			return {ok: false, status: 500, reason: 'error searching for files'};
		}
	},
};

export const createFileService: Service<CreateEntityParams, CreateEntityResponseResult> = {
	event: CreateEntity,
	perform: async ({server, params}) => {
		// TODO security: validate `account_id` against the persona -- maybe as an optimized standalone method?
		// server.db.repos.account.validatePersona(account_id, actor_id);
		const insertFilesResult = await server.db.repos.entity.create(params);
		if (insertFilesResult.ok) {
			return {ok: true, status: 200, value: {file: insertFilesResult.value}}; // TODO API types
		} else {
			console.log('[CreateEntity] error searching for files');
			return {ok: false, status: 500, reason: 'error searching for files'};
		}
	},
};
