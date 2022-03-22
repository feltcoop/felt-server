import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {Service} from '$lib/server/service';
import type {
	CreateTieParams,
	CreateTieResponseResult,
	ReadTiesParams,
	ReadTiesResponseResult,
	DeleteTieParams,
	DeleteTieResponseResult,
} from '$lib/app/eventTypes';
import {CreateTie, ReadTies, DeleteTie} from '$lib/vocab/tie/tieEvents';

const log = new Logger(gray('[') + blue('CreateTie') + gray(']'));

//Creates a new community for an instance
// TODO think about extracting this to a `.services.` file
// that imports a generated type and declares only `perform`
export const createTieService: Service<CreateTieParams, CreateTieResponseResult> = {
	event: CreateTie,
	perform: async ({repos, params}) => {
		log.trace('[CreateTie] params', params);
		// TODO validate that `account_id` is `persona_id`
		const createTieResult = await repos.tie.create(params.source_id, params.dest_id, params.type);
		log.trace('[CreateTie] result', createTieResult);
		if (createTieResult.ok) {
			return {
				ok: true,
				status: 200,
				value: {tie: createTieResult.value},
			}; // TODO API types
		}
		log.trace('[CreateTie] error creating tie');
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
		log.trace('[ReadEntities] error searching for entities');
		return {ok: false, status: 500, message: 'error searching for entities'};
	},
};

//deletes a single tie
export const deleteTieService: Service<DeleteTieParams, DeleteTieResponseResult> = {
	event: DeleteTie,
	perform: async ({repos, params}) => {
		log.trace('[DeleteTie] deleting tie with ids:', params.source_id, params.dest_id);
		const result = await repos.tie.deleteTie(params.source_id, params.dest_id, params.type);
		log.trace('[DeleteTie] result', result);
		if (!result.ok) {
			log.trace('[DeleteTie] error removing tie: ', params.source_id, params.dest_id);
			return {ok: false, status: 500, message: result.message};
		}
		return {ok: true, status: 200, value: null};
	},
};
