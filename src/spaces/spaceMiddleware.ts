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
