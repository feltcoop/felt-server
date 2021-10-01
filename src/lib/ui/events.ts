import type {Readable} from 'svelte/store';
import type {Static} from '@sinclair/typebox';

import type {ClientAccountSession} from '$lib/session/clientSession';
import type {File} from '$lib/vocab/file/file';
import type {ApiResult} from '$lib/server/api';
import type {createCommunityService} from '$lib/vocab/community/communityServices';
import type {createPersonaService} from '$lib/vocab/persona/personaServices';
import type {createMembershipService} from '$lib/vocab/community/communityServices';
import type {createSpaceService} from '$lib/vocab/space/spaceServices';
import type {createFileService, readFilesService} from '$lib/vocab/file/fileServices';
import type {DispatchContext} from '$lib/ui/api';
import type {LoginRequest} from '$lib/session/loginMiddleware.js';
import type {MainNavView} from './ui';

// TODO generate these from data -- maybe `gro gen` should support `.events.` files?
// TODO maybe drop the ``?

type log_in = {
	name: 'log_in';
	params: LoginRequest;
	result: ApiResult<{session: ClientAccountSession}>; // undefined; // TODO ?
	returns: Promise<ApiResult<{session: ClientAccountSession}>>;
};
type log_out = {
	name: 'log_out';
	params: void;
	result: ApiResult<void>;
	returns: Promise<ApiResult<void>>;
};
type create_community = {
	name: 'create_community';
	params: Static<typeof createCommunityService.paramsSchema>;
	result: ApiResult<Static<typeof createCommunityService.responseSchema>>;
	returns: Promise<ApiResult<Static<typeof createCommunityService.responseSchema>>>;
};
type create_persona = {
	name: 'create_persona';
	params: Static<typeof createPersonaService.paramsSchema>;
	result: ApiResult<Static<typeof createPersonaService.responseSchema>>;
	returns: Promise<ApiResult<Static<typeof createPersonaService.responseSchema>>>;
};
type create_membership = {
	name: 'create_membership';
	params: Static<typeof createMembershipService.paramsSchema>;
	result: ApiResult<Static<typeof createMembershipService.responseSchema>>;
	returns: Promise<ApiResult<Static<typeof createMembershipService.responseSchema>>>;
};
type create_space = {
	name: 'create_space';
	params: Static<typeof createSpaceService.paramsSchema>;
	result: ApiResult<Static<typeof createSpaceService.responseSchema>>;
	returns: Promise<ApiResult<Static<typeof createSpaceService.responseSchema>>>;
};
type create_file = {
	name: 'create_file';
	params: Static<typeof createFileService.paramsSchema>;
	result: ApiResult<Static<typeof createFileService.responseSchema>>;
	returns: Promise<ApiResult<Static<typeof createFileService.responseSchema>>>;
};
type read_files = {
	name: 'read_files';
	params: Static<typeof readFilesService.paramsSchema>;
	result: ApiResult<Static<typeof readFilesService.responseSchema>>;
	returns: Promise<ApiResult<Static<typeof readFilesService.responseSchema>>>;
};
// `query_files` differs from `read_files` in that
// it returns a reactive store containing the requested files.
// Its API could be expanded to give callers access to its async status or promise,
// maybe via a third `options` arg with callbacks.
type query_files = {
	name: 'query_files';
	params: Static<typeof readFilesService.paramsSchema>;
	result: void;
	returns: Readable<Readable<File>[]>;
};
type toggle_main_nav = {
	name: 'toggle_main_nav';
	params: void;
	result: void;
	returns: void;
};
type toggle_secondary_nav = {
	name: 'toggle_secondary_nav';
	params: void;
	result: void;
	returns: void;
};
type set_main_nav_view = {
	name: 'set_main_nav_view';
	params: MainNavView;
	result: void;
	returns: void;
};
type set_mobile = {
	name: 'set_mobile';
	params: boolean;
	result: void;
	returns: void;
};
type select_persona = {
	name: 'select_persona';
	params: {persona_id: number};
	result: void;
	returns: void;
};
type select_community = {
	name: 'select_community';
	params: {community_id: number | null};
	result: void;
	returns: void;
};
type select_space = {
	name: 'select_space';
	params: {community_id: number; space_id: number};
	result: void;
	returns: void;
};

export interface Dispatch {
	(eventName: log_in['name'], params: log_in['params']): log_in['returns'];
	(eventName: log_out['name'], params: log_out['params']): log_out['returns'];
	(
		eventName: create_community['name'],
		params: create_community['params'],
	): create_community['returns'];
	(eventName: create_persona['name'], params: create_persona['params']): create_persona['returns'];
	(
		eventName: create_membership['name'],
		params: create_membership['params'],
	): create_membership['returns'];
	(eventName: create_space['name'], params: create_space['params']): create_space['returns'];
	(eventName: create_file['name'], params: create_file['params']): create_file['returns'];
	(eventName: read_files['name'], params: read_files['params']): read_files['returns'];
	(eventName: query_files['name'], params: query_files['params']): query_files['returns'];
	(
		eventName: toggle_main_nav['name'],
		params: toggle_main_nav['params'],
	): toggle_main_nav['returns'];
	(
		eventName: toggle_secondary_nav['name'],
		params: toggle_secondary_nav['params'],
	): toggle_secondary_nav['returns'];
	(
		eventName: set_main_nav_view['name'],
		params: set_main_nav_view['params'],
	): set_main_nav_view['returns'];
	(eventName: set_mobile['name'], params: set_mobile['params']): set_mobile['returns'];
	(eventName: select_persona['name'], params: select_persona['params']): select_persona['returns'];
	(
		eventName: select_community['name'],
		params: select_community['params'],
	): select_community['returns'];
	(eventName: select_space['name'], params: select_space['params']): select_space['returns'];
}

export interface UiHandlers {
	log_in: (ctx: DispatchContext<log_in['params'], log_in['result']>) => log_in['returns'];
	log_out: (ctx: DispatchContext<log_out['params'], log_out['result']>) => log_out['returns'];
	create_community: (
		ctx: DispatchContext<create_community['params'], create_community['result']>,
	) => create_community['returns'];
	create_persona: (
		ctx: DispatchContext<create_persona['params'], create_persona['result']>,
	) => create_persona['returns'];
	create_membership: (
		ctx: DispatchContext<create_membership['params'], create_membership['result']>,
	) => create_membership['returns'];
	create_space: (
		ctx: DispatchContext<create_space['params'], create_space['result']>,
	) => create_space['returns'];
	create_file: (
		ctx: DispatchContext<create_file['params'], create_file['result']>,
	) => create_file['returns'];
	read_files: (
		ctx: DispatchContext<read_files['params'], read_files['result']>,
	) => read_files['returns'];
	query_files: (
		ctx: DispatchContext<query_files['params'], query_files['result']>,
	) => query_files['returns'];
	toggle_main_nav: (
		ctx: DispatchContext<toggle_main_nav['params'], toggle_main_nav['result']>,
	) => toggle_main_nav['returns'];
	toggle_secondary_nav: (
		ctx: DispatchContext<toggle_secondary_nav['params'], toggle_secondary_nav['result']>,
	) => toggle_secondary_nav['returns'];
	set_main_nav_view: (
		ctx: DispatchContext<set_main_nav_view['params'], set_main_nav_view['result']>,
	) => set_main_nav_view['returns'];
	set_mobile: (
		ctx: DispatchContext<set_mobile['params'], set_mobile['result']>,
	) => set_mobile['returns'];
	select_persona: (
		ctx: DispatchContext<select_persona['params'], select_persona['result']>,
	) => select_persona['returns'];
	select_community: (
		ctx: DispatchContext<select_community['params'], select_community['result']>,
	) => select_community['returns'];
	select_space: (
		ctx: DispatchContext<select_space['params'], select_space['result']>,
	) => select_space['returns'];
}
