import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';
import type {SpaceParams} from '$lib/vocab/space/space';

//Returns a single space object
export const to_space_middleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[space_middleware] space', req.params.space_id);

		const find_space_result = await db.repos.space.find_by_id(req.params.space_id);
		if (find_space_result.ok) {
			return send(res, 200, {space: find_space_result.value}); // TODO API types
		} else {
			console.log('no space found');
			const code = find_space_result.type === 'no_space_found' ? 404 : 500;
			return send(res, code, {reason: find_space_result.reason});
		}
	};
};

//Returns all spaces in a given community
export const to_spaces_middleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[space_middleware] retrieving spaces for community', req.params.community_id);

		const find_spaces_result = await db.repos.space.filter_by_community(req.params.community_id);
		if (find_spaces_result.ok) {
			return send(res, 200, {spaces: find_spaces_result.value}); // TODO API types
		} else {
			console.log('[space_middleware] error searching for community spaces');
			return send(res, 500, {reason: 'error searching for community spaces'});
		}
	};
};

//Creates a new space for a given community
export const to_create_space_middleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[space_middleware] creating space for community', req.params.community_id);
		console.log('[space_middleware] body', req.body);

		const space: SpaceParams = req.body;

		const create_space_result = await db.repos.space.create(Number(req.params.community_id), space);
		if (create_space_result.ok) {
			return send(res, 200, {space: create_space_result.value}); // TODO API types
		} else {
			console.log('[space_middleware] error searching for community spaces');
			return send(res, 500, {reason: 'error searching for community spaces'});
		}
	};
};
