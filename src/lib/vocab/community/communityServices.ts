import type {Service} from '$lib/server/service';

export const readCommunitiesService: Service<{}> = {
	handle: async (server, _params, account_id) => {
		const {db} = server;
		const find_communities_result = await db.repos.community.filter_by_account(account_id);
		if (find_communities_result.ok) {
			return {code: 200, data: {communities: find_communities_result.value}};
		} else {
			console.log('[community_service] error searching for communities');
			return {code: 500, data: {reason: 'error searching for communities'}};
		}
	},
};

//Returns a single community object
export const readCommunityService: Service<{community_id: number}> = {
	handle: async (server, params, account_id) => {
		const {db} = server;
		console.log('[community_service] account', account_id); // TODO logging
		console.log('[community_service] community', params.community_id);

		const find_community_result = await db.repos.community.find_by_id(params.community_id as any); // TODO remove the typecast once this PR is rebased
		if (find_community_result.ok) {
			return {code: 200, data: {community: find_community_result.value}};
		} else {
			return {
				code: find_community_result.type === 'no_community_found' ? 404 : 500,
				data: {reason: find_community_result.reason},
			};
		}
	},
};

//Creates a new community for an instance
// TODO automatic params type and validation
export const createCommunityService: Service<{name: string}> = {
	// TODO declarative validation for `req.body` and the rest
	handle: async (server, params, account_id) => {
		const {name} = params;
		if (!name) {
			// TODO declarative validation
			return {code: 400, data: {reason: 'invalid name'}};
		}
		const create_community_result = await server.db.repos.community.insert(name, account_id);
		console.log('create_community_result', create_community_result);
		if (create_community_result.ok) {
			// TODO optimize this to return `create_community_result.value` instead of making another db call,
			// needs to populate members, but we probably want to normalize the data, returning only ids
			const community_data = await server.db.repos.community.filter_by_account(account_id);
			if (community_data.ok) {
				const {community_id} = create_community_result.value;
				return {
					code: 200,
					data: {
						community: community_data.value.find((c) => c.community_id === community_id),
					},
				}; // TODO API types
			} else {
				console.log('[community_service] error retrieving community data');
				return {code: 500, data: {reason: 'error retrieving community data'}};
			}
		} else {
			console.log('[community_service] error creating community');
			return {code: 500, data: {reason: 'error creating community'}};
		}
	},
};

//Creates a new member relation for a community
export const createMemberService: Service<{persona_id: number; community_id: number}> = {
	handle: async (server, params) => {
		console.log('[community_service] creating member', params.persona_id, params.community_id);

		const create_member_result = await server.db.repos.member.create(
			params.persona_id,
			params.community_id,
		);
		if (create_member_result.ok) {
			return {code: 200, data: {member: create_member_result.value}};
		} else {
			console.log('[community_service] error creating member');
			return {code: 500, data: {reason: 'error creating member'}};
		}
	},
};
