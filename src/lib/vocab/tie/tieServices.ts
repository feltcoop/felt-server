import type {Service} from '$lib/server/service';
import type {
	CreateTieParams,
	CreateTieResponseResult,
	ReadTiesParams,
	ReadTiesResponseResult,
} from '$lib/app/eventTypes';
import {CreateTie, ReadTies} from '$lib/vocab/tie/tie.events';

//Creates a new community for an instance
// TODO think about extracting this to a `.services.` file
// that imports a generated type and declares only `perform`
export const createTieService: Service<CreateTieParams, CreateTieResponseResult> = {
	event: CreateTie,
	perform: async ({repos, params}) => {
		console.log('created tie', params);
		// TODO validate that `account_id` is `persona_id`
		const createTieResult = await repos.tie.create(params.source_id, params.dest_id, params.type);
		console.log('createTieResult', createTieResult);
		if (createTieResult.ok) {
			return {
				ok: true,
				status: 200,
				value: {tie: createTieResult.value},
			}; // TODO API types
		}
		console.log('[CreateTie] error creating tie');
		return {
			ok: false,
			status: 500,
			message: 'error creating tie',
		};
	},
};

export const readTiesService: Service<ReadTiesParams, ReadTiesResponseResult> = {
	event: ReadTies,
	perform: async ({repos, params}) => {
		const findTiesResult = await repos.tie.filterBySpace(params.space_id);
		if (findTiesResult.ok) {
			return {ok: true, status: 200, value: {ties: findTiesResult.value}}; // TODO API types
		}
		console.log('[ReadEntities] error searching for entities');
		return {ok: false, status: 500, message: 'error searching for entities'};
	},
};
