import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';

export const to_posts_middleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		if (!req.account_session) {
			// TODO centralize error message strings
			console.log('[post_middleware] no account to search for communities');
			return send(res, 401, {reason: 'not logged in'});
		}
		console.log('[post_middleware] space', req.params.space_id);

		const find_posts_result = await db.repos.post.filter_by_space(req.params.space_id);
		if (find_posts_result.ok) {
			return send(res, 200, {posts: find_posts_result.value}); // TODO API types
		} else {
			console.log('[post_middleware] error searching for posts');
			return send(res, 500, {reason: 'error searching for posts'});
		}
	};
};

export const to_create_post_middleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		if (!req.account_session) {
			// TODO centralize error message strings
			console.log('[post_middleware] no account to post with');
			return send(res, 401, {reason: 'not logged in'});
		}
		console.log('[post_middleware] space', req.params.space_id);
		console.log('[post_middleware] body', req.body);

		// TODO take content from body & build post to pass along with it

		const insert_posts_result = await db.repos.post.insert(
			req.body.actor_id,
			req.params.space_id,
			req.body.content,
		);
		if (insert_posts_result.ok) {
			return send(res, 200, {post: insert_posts_result.value}); // TODO API types
		} else {
			console.log('[post_middleware] error searching for posts');
			return send(res, 500, {reason: 'error searching for posts'});
		}
	};
};
