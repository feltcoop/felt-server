import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';

export const to_files_middleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		if (!req.account_session) {
			// TODO centralize error message strings
			console.log('[file_middleware] no account to search for communities');
			return send(res, 401, {reason: 'not logged in'});
		}
		console.log('[file_middleware] space', req.params.space_id);

		const find_files_result = await db.repos.file.filter_by_space(Number(req.params.space_id));
		if (find_files_result.ok) {
			return send(res, 200, {files: find_files_result.value}); // TODO API types
		} else {
			console.log('[file_middleware] error searching for files');
			return send(res, 500, {reason: 'error searching for files'});
		}
	};
};

export const to_create_file_middleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		if (!req.account_session) {
			// TODO centralize error message strings
			console.log('[file_middleware] no account to file with');
			return send(res, 401, {reason: 'not logged in'});
		}
		console.log('[file_middleware] space', req.params.space_id);
		console.log('[file_middleware] body', req.body);

		// TODO take content from body & build file to pass along with it

		const create_files_result = await db.repos.file.create(
			req.body.actor_id,
			Number(req.params.space_id),
			req.body.content,
		);
		if (create_files_result.ok) {
			return send(res, 200, {file: create_files_result.value}); // TODO API types
		} else {
			console.log('[file_middleware] error searching for files');
			return send(res, 500, {reason: 'error searching for files'});
		}
	};
};
