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

// TODO generate this interface from data or define programmatically along with `UiHandlers`
export interface Dispatch {
	// TODO convert log_in and log_out to services
	(eventName: 'log_in', params: LoginRequest): Promise<ApiResult<{session: ClientAccountSession}>>; // TODO
	(eventName: 'log_out', params?: undefined): Promise<ApiResult<void>>; // TODO type?
	(
		eventName: 'create_community',
		params: Static<typeof createCommunityService.paramsSchema>,
	): Promise<ApiResult<Static<typeof createCommunityService.responseSchema>>>;
	(eventName: 'create_persona', params: Static<typeof createPersonaService.paramsSchema>): Promise<
		ApiResult<Static<typeof createPersonaService.responseSchema>>
	>;
	(
		eventName: 'create_membership',
		params: Static<typeof createMembershipService.paramsSchema>,
	): Promise<ApiResult<Static<typeof createMembershipService.responseSchema>>>;
	(eventName: 'create_space', params: Static<typeof createSpaceService.paramsSchema>): Promise<
		ApiResult<Static<typeof createSpaceService.responseSchema>>
	>;
	(eventName: 'create_file', params: Static<typeof createFileService.paramsSchema>): Promise<
		ApiResult<Static<typeof createFileService.responseSchema>>
	>;
	(eventName: 'read_files', params: Static<typeof readFilesService.paramsSchema>): Promise<
		ApiResult<Static<typeof readFilesService.responseSchema>>
	>;
	// `query_files` differs from `read_files` in that
	// it returns a reactive store containing the requested files.
	// Its API could be expanded to give callers access to its async status or promise,
	// maybe via a third `options` arg with callbacks.
	(eventName: 'query_files', params: Static<typeof readFilesService.paramsSchema>): Readable<
		Readable<File>[]
	>;
	(eventName: 'toggle_main_nav', params?: any): void;
	(eventName: 'toggle_secondary_nav', params?: any): void;
	(eventName: 'set_main_nav_view', params: MainNavView): void;
	(eventName: 'set_mobile', params: boolean): void;
	(eventName: 'select_persona', params: {persona_id: number}): void;
	(eventName: 'select_community', params: {community_id: number | null}): void;
	(eventName: 'select_space', params: {community_id: number; space_id: number | null}): void;
}

// TODO generate this interface from data or define programmatically along with `Dispatch`
export interface UiHandlers {
	// TODO `log_in` and `log_out` have no service or schema; they're custom endpoints right now,
	// but they should be converted to services to match the rest.
	// For now they serve as good examples of a usecase needing an escape hatch,
	// because they need to use the api client directly. (because `invoke` is only for services)
	log_in: (
		ctx: DispatchContext<LoginRequest, ApiResult<{session: ClientAccountSession}>>,
	) => Promise<ApiResult<{session: ClientAccountSession}>>;
	log_out: (ctx: DispatchContext<null, ApiResult<void>>) => Promise<ApiResult<void>>;
	create_community: (
		ctx: DispatchContext<
			Static<typeof createCommunityService.paramsSchema>,
			ApiResult<Static<typeof createCommunityService.responseSchema>>
		>,
	) => Promise<ApiResult<Static<typeof createCommunityService.responseSchema>>>;
	create_persona: (
		ctx: DispatchContext<
			Static<typeof createPersonaService.paramsSchema>,
			ApiResult<Static<typeof createPersonaService.responseSchema>>
		>,
	) => Promise<ApiResult<Static<typeof createPersonaService.responseSchema>>>;
	create_membership: (
		ctx: DispatchContext<
			Static<typeof createMembershipService.paramsSchema>,
			ApiResult<Static<typeof createMembershipService.responseSchema>>
		>,
	) => Promise<ApiResult<Static<typeof createMembershipService.responseSchema>>>;
	create_space: (
		ctx: DispatchContext<
			Static<typeof createSpaceService.paramsSchema>,
			ApiResult<Static<typeof createSpaceService.responseSchema>>
		>,
	) => Promise<ApiResult<Static<typeof createSpaceService.responseSchema>>>;
	create_file: (
		ctx: DispatchContext<
			Static<typeof createFileService.paramsSchema>,
			ApiResult<Static<typeof createFileService.responseSchema>>
		>,
	) => Promise<ApiResult<Static<typeof createFileService.responseSchema>>>;
	read_files: (
		ctx: DispatchContext<
			Static<typeof readFilesService.paramsSchema>,
			ApiResult<Static<typeof readFilesService.responseSchema>>
		>,
	) => Promise<ApiResult<Static<typeof readFilesService.responseSchema>>>;
	query_files: (
		ctx: DispatchContext<Static<typeof readFilesService.paramsSchema>>,
		dispatch: Dispatch,
	) => Readable<Readable<File>[]>;
	toggle_main_nav: () => void;
	toggle_secondary_nav: () => void;
	set_main_nav_view: (ctx: DispatchContext<MainNavView>) => void;
	set_mobile: (ctx: DispatchContext<boolean>) => void;
	select_persona: (ctx: DispatchContext<{persona_id: number}>) => void;
	select_community: (ctx: DispatchContext<{community_id: number | null}>) => void;
	select_space: (ctx: DispatchContext<{community_id: number; space_id: number | null}>) => void;
}
