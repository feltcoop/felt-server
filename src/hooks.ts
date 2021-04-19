import type {GetContext, GetSession, Handle} from '@sveltejs/kit';
import * as http from 'http';
import {existsSync} from 'fs';

import type {ClientSession} from './session/clientSession.js';
import type {ClientContext} from './server/ApiServer.js';

// TODO soo ... below is a lot of dead code that might be better, but doesn't work.
// Skip down to the uncommented code for the current implementation.
// TLDR: everything is bad. We need to figure out regular ESM imports. They don't work.

// Vite or SvelteKit is giving us an invalid `import.meta.url`,
// so we do a hackier detection to see if we're running the final production build:
// console.log('import.meta.url', import.meta.url);
// TODO why is this error happening? Vite is giving us a weird `import.meta.url`?
// TypeError [ERR_INVALID_URL]: Invalid URL: //home/desk/dev/felt-server/src/hooks
// const filePath = fileURLToPath(import.meta.url);
// const filePath = import.meta.url.slice(1) + '.js';
// console.log('filePath', filePath);
// const serverPath = join(filePath, '');
// console.log('serverPath', serverPath);

const dev = process.env.NODE_ENV !== 'production';

// Everything about this is bad. See above for more context.
const serverExists = !dev && existsSync('dist/server/server.js');
// neither of these work, but .. they should?
// import {DEFAULT_DEV_PORT, DEFAULT_PROD_PORT} from '$lib/constants.js';
// import {DEFAULT_DEV_PORT, DEFAULT_PROD_PORT} from './lib/constants.js';
// const serverPort = serverExists ? DEFAULT_PROD_PORT : DEFAULT_DEV_PORT;
// none of the above work, also,
// `process['env'].PORT` is written that way to avoid mangling
const serverPort = serverExists ? Number(process['env'].PORT) || 3000 : 3001;
const serverPath = `http://localhost:${serverPort}/api/v1/context`; // TODO make this a function call, at least in production

// TODO how to import this without breaking everything silently?
// import {db} from '$lib/db/db.js';

// TODO this is throwing, it's compiled to cjs by sveltekit or vite I think
// import {Logger} from '@feltcoop/gro/dist/utils/log.js';
// const log = new Logger(['[hooks]']);

export const getContext: GetContext<Promise<ClientContext>> = async function ({headers}) {
	// const {body, headers, host, method, path, query} = incoming;
	// TODO fix imports to db
	// TODO needs different handling in production
	// const result = await fetch(, {headers});
	console.log('[getContext]');
	try {
		// TODO this is terrible, but imports, how do they work? ESM is broken?
		return fetchJson(serverPath, {headers});
	} catch (error) {
		return {guest: true, error};
	}
};

export const getSession: GetSession<ClientContext, ClientSession> = (ctx) => {
	console.log('[getSession] authenticated:', !ctx.context.guest);
	const {context} = ctx;
	return context && 'account' in context
		? {
				// don't expose data that should be on the server only!
				account: {name: context.account.name},
				entities: [], // TODO load
		  }
		: {guest: true}; // TODO is swallowing `context.error`, only return in dev mode? look for "reason"?
};

export const handle: Handle = async ({request, render}) => {
	console.log('[handle]', request.path, request.context?.account?.name);
	const response = await render(request);
	return response;
	// return {
	// 	...response,
	// 	headers: {
	// 		...response.headers,
	// 		'x-custom-header': 'giraffe',
	// 	},
	// };
};

// TODO move this or better yet, get rid of this completely and don't make http calls in here.
// see the discussion at the top of this file
const fetchJson = async (url: string, options: http.RequestOptions): Promise<any> =>
	new Promise((resolve, reject) => {
		http
			.get(
				url,
				{
					...options,
					headers: {...options.headers, 'content-type': 'application/json'},
				},
				(res) => {
					if (res.statusCode !== 200) {
						console.error('failed request with status code', res.statusCode, url);
						res.resume();
						return;
					}
					res.setEncoding('utf8');
					let raw = '';
					res.on('data', (chunk) => {
						raw += chunk;
					});
					res.on('end', () => {
						try {
							resolve(JSON.parse(raw));
						} catch (err) {
							reject(err);
						}
					});
				},
			)
			.on('error', (err) => {
				reject(err);
			});
	});
