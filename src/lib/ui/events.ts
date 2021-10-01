// generated by src/lib/ui/events.gen.ts

import type {Readable} from 'svelte/store';
import type {Static} from '@sinclair/typebox';

import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ApiResult} from '$lib/server/api';
import type {Community} from '$lib/vocab/community/community';
import type {Persona} from '$lib/vocab/persona/persona';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Space} from '$lib/vocab/space/space';
import type {File} from '$lib/vocab/file/file';
import type {DispatchContext} from '$lib/ui/api';
import type {LoginRequest} from '$lib/session/loginMiddleware.js';
import type {MainNavView} from './ui';

export interface Dispatch {
	(eventName: 'log_in', params: LoginRequest): Promise<ApiResult<{session: ClientAccountSession}>>;
	(eventName: 'log_out', params: void): Promise<ApiResult<void>>;
	(eventName: 'create_community', params: {name: string; persona_id: number}): Promise<
		ApiResult<{community: Community}>
	>;
	(eventName: 'create_persona', params: {name: string}): Promise<
		ApiResult<{persona: Persona; community: Community}>
	>;
	(eventName: 'create_membership', params: {persona_id: number; community_id: number}): Promise<
		ApiResult<{membership: Membership}>
	>;
	(
		eventName: 'create_space',
		params: {
			community_id: number;
			name: string;
			url: string;
			media_type: string;
			content: string;
		},
	): Promise<ApiResult<{space: Space}>>;
	(
		eventName: 'create_file',
		params: {
			actor_id: number;
			space_id: number;
			content: string;
		},
	): Promise<ApiResult<{file: File}>>;
	(eventName: 'read_files', params: {space_id: number}): Promise<ApiResult<{files: File[]}>>;
	(eventName: 'query_files', params: {space_id: number}): Readable<Readable<File>[]>;
	(eventName: 'toggle_main_nav', params: void): void;
	(eventName: 'toggle_secondary_nav', params: void): void;
	(eventName: 'set_main_nav_view', params: MainNavView): void;
	(eventName: 'set_mobile', params: boolean): void;
	(eventName: 'select_persona', params: {persona_id: number}): void;
	(eventName: 'select_community', params: {community_id: number | null}): void;
	(eventName: 'select_space', params: {community_id: number; space_id: number}): void;
}

export interface UiHandlers {
	log_in: (
		ctx: DispatchContext<LoginRequest, ApiResult<{session: ClientAccountSession}>>,
	) => Promise<ApiResult<{session: ClientAccountSession}>>;
	log_out: (ctx: DispatchContext<void, ApiResult<void>>) => Promise<ApiResult<void>>;
	create_community: (
		ctx: DispatchContext<{name: string; persona_id: number}, ApiResult<{community: Community}>>,
	) => Promise<ApiResult<{community: Community}>>;
	create_persona: (
		ctx: DispatchContext<{name: string}, ApiResult<{persona: Persona; community: Community}>>,
	) => Promise<ApiResult<{persona: Persona; community: Community}>>;
	create_membership: (
		ctx: DispatchContext<
			{persona_id: number; community_id: number},
			ApiResult<{membership: Membership}>
		>,
	) => Promise<ApiResult<{membership: Membership}>>;
	create_space: (
		ctx: DispatchContext<
			{
				community_id: number;
				name: string;
				url: string;
				media_type: string;
				content: string;
			},
			ApiResult<{space: Space}>
		>,
	) => Promise<ApiResult<{space: Space}>>;
	create_file: (
		ctx: DispatchContext<
			{
				actor_id: number;
				space_id: number;
				content: string;
			},
			ApiResult<{file: File}>
		>,
	) => Promise<ApiResult<{file: File}>>;
	read_files: (
		ctx: DispatchContext<{space_id: number}, ApiResult<{files: File[]}>>,
	) => Promise<ApiResult<{files: File[]}>>;
	query_files: (ctx: DispatchContext<{space_id: number}, void>) => Readable<Readable<File>[]>;
	toggle_main_nav: (ctx: DispatchContext<void, void>) => void;
	toggle_secondary_nav: (ctx: DispatchContext<void, void>) => void;
	set_main_nav_view: (ctx: DispatchContext<MainNavView, void>) => void;
	set_mobile: (ctx: DispatchContext<boolean, void>) => void;
	select_persona: (ctx: DispatchContext<{persona_id: number}, void>) => void;
	select_community: (ctx: DispatchContext<{community_id: number | null}, void>) => void;
	select_space: (ctx: DispatchContext<{community_id: number; space_id: number}, void>) => void;
}

// generated by src/lib/ui/events.gen.ts
