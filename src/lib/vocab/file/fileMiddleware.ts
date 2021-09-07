import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';
import type {Service} from '$lib/server/service';

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

// TODO automatic params type and validation
// TODO should this use the `FileParams` type?
export const create_file_service: Service<{actor_id: number; space_id: number; content: string}> = {
	handle: async (server, params, _account_id) => {
		// TODO validate `account_id` against the persona -- maybe as an optimized standalone method?
		// server.db.repos.account.validate_persona(account_id, actor_id);
		const insert_files_result = await server.db.repos.file.insert(
			params.actor_id,
			params.space_id as any, // TODO remove the typecast once this PR is rebased
			params.content,
		);
		if (insert_files_result.ok) {
			return {code: 200, data: {file: insert_files_result.value}}; // TODO API types
		} else {
			console.log('[file_middleware] error searching for files');
			return {code: 500, data: {reason: 'error searching for files'}};
		}
	},
};
