import send from '@polka/send-type';
import type {ApiServer, Middleware} from '../server/ApiServer.js';

export const toCommunitiesMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		if (!req.session.name) {
			//TODO centralize error message strings
			console.log('[communityMiddleware] no account to search for communities');
			return send(res, 401, {reason: 'not logged in'});
		}
		console.log('[communityMiddleware] account', req.user); // TODO logging

		const findCommunitiesResult = await db.repos.communities.filterByAccount(req.user!);
		if (findCommunitiesResult.ok) {
			return send(res, 200, {communities: findCommunitiesResult.value}); // TODO API types
		} else {
			console.log('[communityMiddleware] no communities found');
			const code = findCommunitiesResult.type === 'noCommunitiesFound' ? 404 : 500;
			return send(res, code, {reason: findCommunitiesResult.reason});
		}
	};
};

//Returns a single community object
export const toCommunityMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[communityMiddleware] account', req.user); // TODO logging
		console.log('[communityMiddleware] community', req.params.community_id);

		const findCommunityResult = await db.repos.communities.findById(req.params.community_id);
		if (findCommunityResult.ok) {
			return send(res, 200, {community: findCommunityResult.value}); // TODO API types
		} else {
			console.log('no community found');
			const code = findCommunityResult.type === 'noCommunityFound' ? 404 : 500;
			return send(res, code, {reason: findCommunityResult.reason});
		}
	};
};
