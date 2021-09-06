import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';

export const to_files_middleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		const find_files_result = await db.repos.file.filter_by_space(req.params.space_id);
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
		console.log('[file_middleware] space', req.params.space_id);
		console.log('[file_middleware] body', req.body);

		// TODO take content from body & build file to pass along with it

		const insert_files_result = await db.repos.file.insert(
			req.body.actor_id,
			req.params.space_id,
			req.body.content,
		);
		if (insert_files_result.ok) {
			return send(res, 200, {file: insert_files_result.value}); // TODO API types
		} else {
			console.log('[file_middleware] error searching for files');
			return send(res, 500, {reason: 'error searching for files'});
		}
	};
};
