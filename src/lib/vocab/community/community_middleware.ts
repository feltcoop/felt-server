import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';
import type {MemberParams} from '$lib/vocab/member/member';
import type {Service} from '$lib/server/service';

export const to_communities_middleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		const find_communities_result = await db.repos.community.filter_by_account(
			req.session.account_id!,
		);
		if (find_communities_result.ok) {
			return send(res, 200, {communities: find_communities_result.value}); // TODO API types
		} else {
			console.log('[community_middleware] error searching for communities');
			return send(res, 500, {reason: 'error searching for communities'});
		}
	};
};

//Returns a single community object
export const to_community_middleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		console.log('[community_middleware] account', req.account_session!.account.account_id); // TODO logging
		console.log('[community_middleware] community', req.params.community_id);

		const find_community_result = await db.repos.community.find_by_id(req.params.community_id);
		if (find_community_result.ok) {
			return send(res, 200, {community: find_community_result.value}); // TODO API types
		} else {
			const code = find_community_result.type === 'no_community_found' ? 404 : 500;
			return send(res, code, {reason: find_community_result.reason});
		}
	};
};

//Creates a new community for an instance
// TODO automatic params type and validation
export const create_community_service: Service<{name: string}> = {
	// TODO declarative validation for `req.body` and the rest
	handle: async (server, params, account) => {
		const {db} = server;
		const {name} = params;
		if (!name) {
			// TODO declarative validation
			return {code: 400, data: {reason: 'invalid name'}};
		}
		const create_community_result = await db.repos.community.insert(name, account.account_id);
		console.log('create_community_result', create_community_result);
		if (create_community_result.ok) {
			// TODO optimize this to return `create_community_result.value` instead of making another db call,
			// needs to populate members, but we probably want to normalize the data, returning only ids
			const community_data = await db.repos.community.filter_by_account(account.account_id);
			if (community_data.ok) {
				const {community_id} = create_community_result.value;
				return {
					code: 200,
					data: {
						community: community_data.value.find((c) => c.community_id === community_id),
					},
				}; // TODO API types
			} else {
				console.log('[community_middleware] error retrieving community data');
				return {code: 500, data: {reason: 'error retrieving community data'}};
			}
		} else {
			console.log('[community_middleware] error creating community');
			return {code: 500, data: {reason: 'error creating community'}};
		}
	},
};

//Creates a new member relation for a community
export const to_create_member_middleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		const member: MemberParams = req.body; // TODO move this type
		console.log('[community_middleware] creating member', member);

		const create_member_result = await db.repos.member.create(
			member.persona_id,
			member.community_id,
		);
		if (create_member_result.ok) {
			return send(res, 200, {member: create_member_result.value}); // TODO API types
		} else {
			console.log('[community_middleware] error creating member');
			return send(res, 500, {reason: 'error creating member'});
		}
	};
};
