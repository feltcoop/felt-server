import send from '@polka/send-type';
import type {ApiServer, Middleware} from '../server/ApiServer.js';

export const toCommunitiesMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		if (!req.accountSession) {
			//TODO centralize error message strings
			console.log('[communityMiddleware] no account to search for communities');
			return send(res, 401, {reason: 'not logged in'});
		}
		console.log('[communityMiddleware] account', req.accountSession); // TODO logging

		const findCommunitiesResult = await db.repos.communities.filterByAccount(
			req.accountSession.account.account_id!,
		);
		if (findCommunitiesResult.ok) {
			return send(res, 200, {communities: findCommunitiesResult.value}); // TODO API types
		} else {
			console.log('[communityMiddleware] error while searching for communities');
			return send(res, 500, {reason: 'error while searching for communities'});
		}
	};
};

//Returns a single community object
export const toCommunityMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		if (!req.accountSession) {
			//TODO centralize error message strings
			console.log('[communityMiddleware] no account to search for communities');
			return send(res, 401, {reason: 'not logged in'});
		}

		console.log('[communityMiddleware] account', req.accountSession.account.account_id!); // TODO logging
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

//Creates a new community for an instance
export const toCreateCommunityMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		if (!req.accountSession) {
			//TODO centralize error message strings
			console.log('[communityMiddleware] no account to search for communities');
			return send(res, 401, {reason: 'not logged in'});
		}
		console.log('[communityMiddleware] creating community', req.body);

		const createCommunityResult = await db.repos.communities.insert(
			req.body.name,
			req.accountSession.account.account_id!,
		);
		if (createCommunityResult.ok) {
			const communityData = await db.repos.communities.filterByAccount(
				req.accountSession.account.account_id!,
			);
			if (communityData.ok) {
				return send(res, 200, {community: communityData.value}); // TODO API types
			} else {
				console.log('[communityMiddleware] error while retrieving community data');
				return send(res, 500, {reason: ' error while retrieving community data'});
			}
		} else {
			console.log('[communityMiddleware] error while creating community');
			return send(res, 500, {reason: ' error while creating community'});
		}
	};
};

//Creates a new member relation for a community
export const toCreateMemberMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		if (!req.accountSession) {
			//TODO centralize error message strings
			console.log('[communityMiddleware] no account to search for communities');
			return send(res, 401, {reason: 'not logged in'});
		}
		console.log(
			'[communityMiddleware] creating member',
			req.params.community_id,
			req.body.account_id,
		);

		const createMemberResult = await db.repos.members.create(
			req.body.account_id,
			req.params.community_id,
		);
		if (createMemberResult.ok) {
			return send(res, 200, {}); // TODO API types
		} else {
			console.log('[communityMiddleware] error while creating member');
			return send(res, 500, {reason: ' error while creating member'});
		}
	};
};
