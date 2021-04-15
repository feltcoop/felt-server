import send from '@polka/send-type';
import type {ApiServer, Middleware} from '../server/ApiServer.js';

export const toCommunitiesMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[communityMiddlware] account', req.user); // TODO logging

		const findCommunitiesResult = await db.repos.communities.filterByAccount(req.user);
		return send(res, 200, {communities: findCommunitiesResult}); // TODO API types
	};
};

//Returns a single community object
export const toCommunityMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[communityMiddlware] account', req.user); // TODO logging
		console.log('[communityMiddlware] community', req.params.community_id);

		const findCommunityResult = await db.repos.communities.findById(req.params.community_id);
		return send(res, 200, {community: findCommunityResult}); // TODO API types
	};
};
