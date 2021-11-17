// generated by src/lib/app/eventTypes.gen.ts

import type {Readable} from 'svelte/store';

import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ApiResult} from '$lib/server/api';
import type {Community} from '$lib/vocab/community/community';
import type {Persona} from '$lib/vocab/persona/persona';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Space} from '$lib/vocab/space/space';
import type {File} from '$lib/vocab/file/file';
import type {DispatchContext} from '$lib/ui/api';

export interface EventParams {
	log_in: LogInParams;
	log_out: LogOutParams;
	create_community: CreateCommunityParams;
	read_community: ReadCommunityParams;
	read_communities: ReadCommunitiesParams;
	create_persona: CreatePersonaParams;
	create_membership: CreateMembershipParams;
	create_space: CreateSpaceParams;
	read_space: ReadSpaceParams;
	read_spaces: ReadSpacesParams;
	create_file: CreateFileParams;
	read_files: ReadFilesParams;
	query_files: QueryFilesParams;
	toggle_main_nav: ToggleMainNavParams;
	toggle_secondary_nav: ToggleSecondaryNavParams;
	set_main_nav_view: SetMainNavViewParams;
	set_mobile: SetMobileParams;
	select_persona: SelectPersonaParams;
	select_community: SelectCommunityParams;
	select_space: SelectSpaceParams;
}
export interface EventResponse {
	log_in: LogInResponse;
	log_out: LogOutResponse;
	create_community: CreateCommunityResponse;
	read_community: ReadCommunityResponse;
	read_communities: ReadCommunitiesResponse;
	create_persona: CreatePersonaResponse;
	create_membership: CreateMembershipResponse;
	create_space: CreateSpaceResponse;
	read_space: ReadSpaceResponse;
	read_spaces: ReadSpacesResponse;
	create_file: CreateFileResponse;
	read_files: ReadFilesResponse;
}

export interface LogInParams {
	accountName: string;
	password: string;
}

export type LogInResponse = null;

// TODO hacky, the ApiResult type should be represented in the schema
// but that requires generic type generation:
// https://github.com/bcherny/json-schema-to-typescript/issues/59
export type LogInResponseResult = ApiResult<LogInResponse>;

export type LogOutParams = void;
export interface LogOutResponse {
	message: string;
}

// TODO hacky, the ApiResult type should be represented in the schema
// but that requires generic type generation:
// https://github.com/bcherny/json-schema-to-typescript/issues/59
export type LogOutResponseResult = ApiResult<LogOutResponse>;

export interface CreateCommunityParams {
	name: string;
	persona_id: number;
}

export interface CreateCommunityResponse {
	community: Community;
}

// TODO hacky, the ApiResult type should be represented in the schema
// but that requires generic type generation:
// https://github.com/bcherny/json-schema-to-typescript/issues/59
export type CreateCommunityResponseResult = ApiResult<CreateCommunityResponse>;

export interface ReadCommunityParams {
	community_id: number;
}

export interface ReadCommunityResponse {
	community: Community;
}

// TODO hacky, the ApiResult type should be represented in the schema
// but that requires generic type generation:
// https://github.com/bcherny/json-schema-to-typescript/issues/59
export type ReadCommunityResponseResult = ApiResult<ReadCommunityResponse>;

export interface ReadCommunitiesParams {}

export interface ReadCommunitiesResponse {
	communities: Community[];
}

// TODO hacky, the ApiResult type should be represented in the schema
// but that requires generic type generation:
// https://github.com/bcherny/json-schema-to-typescript/issues/59
export type ReadCommunitiesResponseResult = ApiResult<ReadCommunitiesResponse>;

export interface CreatePersonaParams {
	name: string;
}

export interface CreatePersonaResponse {
	persona: Persona;
	community: Community;
}

// TODO hacky, the ApiResult type should be represented in the schema
// but that requires generic type generation:
// https://github.com/bcherny/json-schema-to-typescript/issues/59
export type CreatePersonaResponseResult = ApiResult<CreatePersonaResponse>;

export interface CreateMembershipParams {
	persona_id: number;
	community_id: number;
}

export interface CreateMembershipResponse {
	membership: Membership;
}

// TODO hacky, the ApiResult type should be represented in the schema
// but that requires generic type generation:
// https://github.com/bcherny/json-schema-to-typescript/issues/59
export type CreateMembershipResponseResult = ApiResult<CreateMembershipResponse>;

export interface CreateSpaceParams {
	community_id: number;
	name: string;
	url: string;
	media_type: string;
	content: string;
}

export interface CreateSpaceResponse {
	space: Space;
}

// TODO hacky, the ApiResult type should be represented in the schema
// but that requires generic type generation:
// https://github.com/bcherny/json-schema-to-typescript/issues/59
export type CreateSpaceResponseResult = ApiResult<CreateSpaceResponse>;

export interface ReadSpaceParams {
	space_id: number;
}

export interface ReadSpaceResponse {
	space: Space;
}

// TODO hacky, the ApiResult type should be represented in the schema
// but that requires generic type generation:
// https://github.com/bcherny/json-schema-to-typescript/issues/59
export type ReadSpaceResponseResult = ApiResult<ReadSpaceResponse>;

export interface ReadSpacesParams {
	community_id: number;
}

export interface ReadSpacesResponse {
	spaces: Space[];
}

// TODO hacky, the ApiResult type should be represented in the schema
// but that requires generic type generation:
// https://github.com/bcherny/json-schema-to-typescript/issues/59
export type ReadSpacesResponseResult = ApiResult<ReadSpacesResponse>;

export interface CreateFileParams {
	actor_id: number;
	space_id: number;
	content: string;
}

export interface CreateFileResponse {
	file: File;
}

// TODO hacky, the ApiResult type should be represented in the schema
// but that requires generic type generation:
// https://github.com/bcherny/json-schema-to-typescript/issues/59
export type CreateFileResponseResult = ApiResult<CreateFileResponse>;

export interface ReadFilesParams {
	space_id: number;
}

export interface ReadFilesResponse {
	files: File[];
}

// TODO hacky, the ApiResult type should be represented in the schema
// but that requires generic type generation:
// https://github.com/bcherny/json-schema-to-typescript/issues/59
export type ReadFilesResponseResult = ApiResult<ReadFilesResponse>;

export interface QueryFilesParams {
	space_id: number;
}

export type ToggleMainNavParams = void;

export type ToggleSecondaryNavParams = void;

export type SetMainNavViewParams = 'explorer' | 'account';

export type SetMobileParams = boolean;

export interface SelectPersonaParams {
	persona_id: number;
}

export interface SelectCommunityParams {
	community_id: number | null;
}

export interface SelectSpaceParams {
	community_id: number;
	space_id: number;
}

export interface Dispatch {
	(eventName: 'log_in', params: LogInParams): Promise<ApiResult<{session: ClientAccountSession}>>;
	(eventName: 'log_out', params: LogOutParams): Promise<LogOutResponseResult>;
	(
		eventName: 'create_community',
		params: CreateCommunityParams,
	): Promise<CreateCommunityResponseResult>;
	(eventName: 'read_community', params: ReadCommunityParams): Promise<ReadCommunityResponseResult>;
	(
		eventName: 'read_communities',
		params: ReadCommunitiesParams,
	): Promise<ReadCommunitiesResponseResult>;
	(eventName: 'create_persona', params: CreatePersonaParams): Promise<CreatePersonaResponseResult>;
	(
		eventName: 'create_membership',
		params: CreateMembershipParams,
	): Promise<CreateMembershipResponseResult>;
	(eventName: 'create_space', params: CreateSpaceParams): Promise<CreateSpaceResponseResult>;
	(eventName: 'read_space', params: ReadSpaceParams): Promise<ReadSpaceResponseResult>;
	(eventName: 'read_spaces', params: ReadSpacesParams): Promise<ReadSpacesResponseResult>;
	(eventName: 'create_file', params: CreateFileParams): Promise<CreateFileResponseResult>;
	(eventName: 'read_files', params: ReadFilesParams): Promise<ReadFilesResponseResult>;
	(eventName: 'query_files', params: QueryFilesParams): Readable<Readable<File>[]>;
	(eventName: 'toggle_main_nav', params: ToggleMainNavParams): void;
	(eventName: 'toggle_secondary_nav', params: ToggleSecondaryNavParams): void;
	(eventName: 'set_main_nav_view', params: SetMainNavViewParams): void;
	(eventName: 'set_mobile', params: SetMobileParams): void;
	(eventName: 'select_persona', params: SelectPersonaParams): void;
	(eventName: 'select_community', params: SelectCommunityParams): void;
	(eventName: 'select_space', params: SelectSpaceParams): void;
}

export interface UiHandlers {
	log_in: (
		ctx: DispatchContext<LogInParams, LogInResponseResult>,
	) => Promise<ApiResult<{session: ClientAccountSession}>>;
	log_out: (
		ctx: DispatchContext<LogOutParams, LogOutResponseResult>,
	) => Promise<LogOutResponseResult>;
	create_community: (
		ctx: DispatchContext<CreateCommunityParams, CreateCommunityResponseResult>,
	) => Promise<CreateCommunityResponseResult>;
	read_community: (
		ctx: DispatchContext<ReadCommunityParams, ReadCommunityResponseResult>,
	) => Promise<ReadCommunityResponseResult>;
	read_communities: (
		ctx: DispatchContext<ReadCommunitiesParams, ReadCommunitiesResponseResult>,
	) => Promise<ReadCommunitiesResponseResult>;
	create_persona: (
		ctx: DispatchContext<CreatePersonaParams, CreatePersonaResponseResult>,
	) => Promise<CreatePersonaResponseResult>;
	create_membership: (
		ctx: DispatchContext<CreateMembershipParams, CreateMembershipResponseResult>,
	) => Promise<CreateMembershipResponseResult>;
	create_space: (
		ctx: DispatchContext<CreateSpaceParams, CreateSpaceResponseResult>,
	) => Promise<CreateSpaceResponseResult>;
	read_space: (
		ctx: DispatchContext<ReadSpaceParams, ReadSpaceResponseResult>,
	) => Promise<ReadSpaceResponseResult>;
	read_spaces: (
		ctx: DispatchContext<ReadSpacesParams, ReadSpacesResponseResult>,
	) => Promise<ReadSpacesResponseResult>;
	create_file: (
		ctx: DispatchContext<CreateFileParams, CreateFileResponseResult>,
	) => Promise<CreateFileResponseResult>;
	read_files: (
		ctx: DispatchContext<ReadFilesParams, ReadFilesResponseResult>,
	) => Promise<ReadFilesResponseResult>;
	query_files: (ctx: DispatchContext<QueryFilesParams, void>) => Readable<Readable<File>[]>;
	toggle_main_nav: (ctx: DispatchContext<ToggleMainNavParams, void>) => void;
	toggle_secondary_nav: (ctx: DispatchContext<ToggleSecondaryNavParams, void>) => void;
	set_main_nav_view: (ctx: DispatchContext<SetMainNavViewParams, void>) => void;
	set_mobile: (ctx: DispatchContext<SetMobileParams, void>) => void;
	select_persona: (ctx: DispatchContext<SelectPersonaParams, void>) => void;
	select_community: (ctx: DispatchContext<SelectCommunityParams, void>) => void;
	select_space: (ctx: DispatchContext<SelectSpaceParams, void>) => void;
}

// generated by src/lib/app/eventTypes.gen.ts
