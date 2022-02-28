import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {Service} from '$lib/server/service';
import type {CreateTieParams, CreateTieResponseResult} from '$lib/app/eventTypes';
import {CreateTie} from '$lib/vocab/tie/tie.events';

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
