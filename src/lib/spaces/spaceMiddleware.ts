import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';

//Returns a single space object
export const toSpaceMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[spaceMiddleware] space', req.params.spaceId);

		const findSpaceResult = await db.repos.spaces.findById(req.params.spaceId);
		if (findSpaceResult.ok) {
			return send(res, 200, {community: findSpaceResult.value}); // TODO API types
		} else {
			console.log('no space found');
			const code = findSpaceResult.type === 'noSpaceFound' ? 404 : 500;
			return send(res, code, {reason: findSpaceResult.reason});
		}
	};
};

//Returns all spaces in a given community
export const toSpacesMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[spaceMiddleware] retrieving spaces for community', req.params.community_id);

		const findSpaceResult = await db.repos.spaces.filterByCommunity(req.params.community_id);
		if (findSpaceResult.ok) {
			return send(res, 200, {community: findSpaceResult.value}); // TODO API types
		} else {
			console.log('[spaceMiddleware] error while searching for community spaces');
			return send(res, 500, {reason: 'error while searching for community spaces'});
		}
	};
};

//Creates a new space for a given community
export const toCreateSpaceMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[spaceMiddleware] creating space for community', req.params.community_id);
		console.log('[postMiddleware] body', req.body);

		const createSpaceResult = await db.repos.spaces.insert(
			req.params.community_id,
			req.body.url,
			req.body.media_type,
			req.body.content,
		);
		if (createSpaceResult.ok) {
			return send(res, 200, {space: createSpaceResult.value}); // TODO API types
		} else {
			console.log('[spaceMiddleware] error while searching for community spaces');
			return send(res, 500, {reason: 'error while searching for community spaces'});
		}
	};
};
