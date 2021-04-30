import send from '@polka/send-type';
import type {ApiServer, Middleware} from '../server/ApiServer.js';

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
		console.log('[spaceMiddleware] community', req.params.community_id);

		const findSpaceResult = await db.repos.spaces.filterByCommunity(req.params.community_id);
		if (findSpaceResult.ok) {
			return send(res, 200, {community: findSpaceResult.value}); // TODO API types
		} else {
			console.log('[spaceMiddleware] error while searching for community spaces');
			return send(res, 500, {reason: 'error while searching for community spaces'});
		}
	};
};
