import type {Task} from '@feltcoop/gro/dist/task/task.js';
import type {
	TaskArgs as BuildTaskArgs,
	TaskEvents as BuildTaskEvents,
} from '@feltcoop/gro/dist/build.task.js';
import {spawnProcess, SpawnResult} from '@feltcoop/gro/dist/utils/process.js';
import {move, remove} from '@feltcoop/gro/dist/fs/node.js';
import {
	DIST_DIRNAME,
	SVELTE_KIT_BUILD_DIRNAME,
	SVELTE_KIT_DIST_DIRNAME,
} from '@feltcoop/gro/dist/paths.js';
import {clean} from '@feltcoop/gro/dist/fs/clean.js';
import type {TaskEvents as ServerTaskEvents} from '@feltcoop/gro/dist/server.task.js';
import {wait} from '@feltcoop/gro/dist/utils/async.js';

// CLI args are forwarded to `svelte-kit`

export interface TaskArgs extends BuildTaskArgs {}
export interface TaskEvents extends ServerTaskEvents, BuildTaskEvents {}

export const task: Task<TaskArgs, TaskEvents> = {
	description: 'build for production',
	dev: false,
	run: async ({invokeTask, args, log, events}) => {
		// TODO this should be handled only by the builtin build task,
		// but I'm worried about race conditions
		await clean({dist: true}, log);

		// TODO disabling minification/terser for now, for more readable output
		args.mapInputOptions = (options) => {
			return {
				...options,
				plugins: options.plugins?.filter((plugin) => plugin.name !== 'gro-terser'),
			};
		};

		// the events system is handy for communication between tasks
		events.once('build.createConfig', (config) => {
			log.trace('build.createConfig', config);
		});

		// this must be assigned before the builtin `build` task is invoked below
		let sveltekitKitBuildPromise: Promise<SpawnResult> | null = null;
		args.closeApiServer = async (spawned) => {
			while (!sveltekitKitBuildPromise) await wait(); // uh dont make bugs?
			await sveltekitKitBuildPromise;
			spawned.child.kill();
			await spawned.closed;
		};

		// Run the default builtin Gro build.
		// Running `invokeTask('build')` without the `gro/` prefix
		// would call this task we're in right now in an infinite loop.
		// This builtin build task defaults to
		// building the project's server and Node stuff like this task,
		// but Gro currently does nothing with the frontend by default:
		// https://github.com/feltcoop/gro/issues/106
		await invokeTask('gro/build');

		// Start SvelteKit and Vite, which own the entire frontend build.
		sveltekitKitBuildPromise = spawnProcess('npx', [
			'svelte-kit',
			'build',
			...process.argv.slice(3),
		]);
		await sveltekitKitBuildPromise; // no ur complicated

		// Copy the SvelteKit build output to `dist/`, namespaced in an obvious directory.
		const svelteKitBuildDir = SVELTE_KIT_BUILD_DIRNAME;
		const svelteKitDistDir = `${DIST_DIRNAME}/${SVELTE_KIT_DIST_DIRNAME}`;
		await move(svelteKitBuildDir, svelteKitDistDir);
		// We implement the adapting Svelte server ourselves in production,
		// so this line deletes the default Node adapter server app file.
		// The Node adapter is convenient to keep in place, and we just adjust the final `dist/`.
		await remove(`${svelteKitDistDir}/index.js`);
	},
};
