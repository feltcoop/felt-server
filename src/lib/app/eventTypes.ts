// generated by src/lib/app/eventTypes.gen.ts

import type {Readable} from 'svelte/store';

import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ApiResult} from '$lib/server/api';
import type {Community} from '$lib/vocab/community/community';
import type {Persona} from '$lib/vocab/persona/persona';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Space} from '$lib/vocab/space/space';
import type {File} from '$lib/vocab/file/file';
import type {DispatchContext} from '$lib/app/dispatch';

export interface EventParamsByName {
	LogIn: LogInParams;
	LogOut: LogOutParams;
	CreateCommunity: CreateCommunityParams;
	ReadCommunity: ReadCommunityParams;
	ReadCommunities: ReadCommunitiesParams;
	UpdateCommunitySettings: UpdateCommunitySettingsParams;
	CreatePersona: CreatePersonaParams;
	CreateMembership: CreateMembershipParams;
	DeleteMembership: DeleteMembershipParams;
	CreateSpace: CreateSpaceParams;
	ReadSpace: ReadSpaceParams;
	ReadSpaces: ReadSpacesParams;
	DeleteSpace: DeleteSpaceParams;
	CreateFile: CreateFileParams;
	ReadFiles: ReadFilesParams;
	QueryFiles: QueryFilesParams;
	ping: PingParams;
	ToggleMainNav: ToggleMainNavParams;
	ToggleSecondaryNav: ToggleSecondaryNavParams;
	SetMobile: SetMobileParams;
	SelectPersona: SelectPersonaParams;
	SelectCommunity: SelectCommunityParams;
	SelectSpace: SelectSpaceParams;
}
export interface EventResponseByName {
	LogIn: LogInResponse;
	LogOut: LogOutResponse;
	CreateCommunity: CreateCommunityResponse;
	ReadCommunity: ReadCommunityResponse;
	ReadCommunities: ReadCommunitiesResponse;
	UpdateCommunitySettings: UpdateCommunitySettingsResponse;
	CreatePersona: CreatePersonaResponse;
	CreateMembership: CreateMembershipResponse;
	DeleteMembership: DeleteMembershipResponse;
	CreateSpace: CreateSpaceResponse;
	ReadSpace: ReadSpaceResponse;
	ReadSpaces: ReadSpacesResponse;
	DeleteSpace: DeleteSpaceResponse;
	CreateFile: CreateFileResponse;
	ReadFiles: ReadFilesResponse;
	ping: PingResponse;
}

export interface LogInParams {
	accountName: string;
	password: string;
}
export type LogInResponse = null;
export type LogInResponseResult = ApiResult<LogInResponse>;

export type LogOutParams = void;
export interface LogOutResponse {
	message: string;
}
export type LogOutResponseResult = ApiResult<LogOutResponse>;

export interface CreateCommunityParams {
	name: string;
	persona_id: number;
	settings?: {
		hue: number;
	};
}
export interface CreateCommunityResponse {
	community: Community;
}
export type CreateCommunityResponseResult = ApiResult<CreateCommunityResponse>;

export interface ReadCommunityParams {
	community_id: number;
}
export interface ReadCommunityResponse {
	community: Community;
}
export type ReadCommunityResponseResult = ApiResult<ReadCommunityResponse>;

export interface ReadCommunitiesParams {}
export interface ReadCommunitiesResponse {
	communities: Community[];
}
export type ReadCommunitiesResponseResult = ApiResult<ReadCommunitiesResponse>;

export interface UpdateCommunitySettingsParams {
	community_id: number;
	settings: {
		hue: number;
	};
}
export type UpdateCommunitySettingsResponse = null;
export type UpdateCommunitySettingsResponseResult = ApiResult<UpdateCommunitySettingsResponse>;

export interface CreatePersonaParams {
	name: string;
}
export interface CreatePersonaResponse {
	persona: Persona;
	community: Community;
}
export type CreatePersonaResponseResult = ApiResult<CreatePersonaResponse>;

export interface CreateMembershipParams {
	persona_id: number;
	community_id: number;
}
export interface CreateMembershipResponse {
	membership: Membership;
}
export type CreateMembershipResponseResult = ApiResult<CreateMembershipResponse>;

export interface DeleteMembershipParams {
	persona_id: number;
	community_id: number;
}
export type DeleteMembershipResponse = null;
export type DeleteMembershipResponseResult = ApiResult<DeleteMembershipResponse>;

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
export type CreateSpaceResponseResult = ApiResult<CreateSpaceResponse>;

export interface ReadSpaceParams {
	space_id: number;
}
export interface ReadSpaceResponse {
	space: Space;
}
export type ReadSpaceResponseResult = ApiResult<ReadSpaceResponse>;

export interface ReadSpacesParams {
	community_id: number;
}
export interface ReadSpacesResponse {
	spaces: Space[];
}
export type ReadSpacesResponseResult = ApiResult<ReadSpacesResponse>;

export interface DeleteSpaceParams {
	space_id: number;
}
export type DeleteSpaceResponse = null;
export type DeleteSpaceResponseResult = ApiResult<DeleteSpaceResponse>;

export interface CreateFileParams {
	actor_id: number;
	space_id: number;
	content: string;
}
export interface CreateFileResponse {
	file: File;
}
export type CreateFileResponseResult = ApiResult<CreateFileResponse>;

export interface ReadFilesParams {
	space_id: number;
}
export interface ReadFilesResponse {
	files: File[];
}
export type ReadFilesResponseResult = ApiResult<ReadFilesResponse>;

export interface QueryFilesParams {
	space_id: number;
}

export type PingParams = void;
export type PingResponse = null;
export type PingResponseResult = ApiResult<PingResponse>;

export type ToggleMainNavParams = void;

export type ToggleSecondaryNavParams = void;

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
	(eventName: 'LogIn', params: LogInParams): Promise<ApiResult<{session: ClientAccountSession}>>;
	(eventName: 'LogOut', params: LogOutParams): Promise<LogOutResponseResult>;
	(
		eventName: 'CreateCommunity',
		params: CreateCommunityParams,
	): Promise<CreateCommunityResponseResult>;
	(eventName: 'ReadCommunity', params: ReadCommunityParams): Promise<ReadCommunityResponseResult>;
	(
		eventName: 'ReadCommunities',
		params: ReadCommunitiesParams,
	): Promise<ReadCommunitiesResponseResult>;
	(
		eventName: 'UpdateCommunitySettings',
		params: UpdateCommunitySettingsParams,
	): Promise<UpdateCommunitySettingsResponseResult>;
	(eventName: 'CreatePersona', params: CreatePersonaParams): Promise<CreatePersonaResponseResult>;
	(
		eventName: 'CreateMembership',
		params: CreateMembershipParams,
	): Promise<CreateMembershipResponseResult>;
	(
		eventName: 'DeleteMembership',
		params: DeleteMembershipParams,
	): Promise<DeleteMembershipResponseResult>;
	(eventName: 'CreateSpace', params: CreateSpaceParams): Promise<CreateSpaceResponseResult>;
	(eventName: 'ReadSpace', params: ReadSpaceParams): Promise<ReadSpaceResponseResult>;
	(eventName: 'ReadSpaces', params: ReadSpacesParams): Promise<ReadSpacesResponseResult>;
	(eventName: 'DeleteSpace', params: DeleteSpaceParams): Promise<DeleteSpaceResponseResult>;
	(eventName: 'CreateFile', params: CreateFileParams): Promise<CreateFileResponseResult>;
	(eventName: 'ReadFiles', params: ReadFilesParams): Promise<ReadFilesResponseResult>;
	(eventName: 'QueryFiles', params: QueryFilesParams): Readable<Readable<File>[]>;
	(eventName: 'ping', params: PingParams): Promise<ApiResult<null>>;
	(eventName: 'ToggleMainNav', params: ToggleMainNavParams): void;
	(eventName: 'ToggleSecondaryNav', params: ToggleSecondaryNavParams): void;
	(eventName: 'SetMobile', params: SetMobileParams): void;
	(eventName: 'SelectPersona', params: SelectPersonaParams): void;
	(eventName: 'SelectCommunity', params: SelectCommunityParams): void;
	(eventName: 'SelectSpace', params: SelectSpaceParams): void;
}

export interface UiHandlers {
	LogIn: (
		ctx: DispatchContext<LogInParams, LogInResponseResult>,
	) => Promise<ApiResult<{session: ClientAccountSession}>>;
	LogOut: (
		ctx: DispatchContext<LogOutParams, LogOutResponseResult>,
	) => Promise<LogOutResponseResult>;
	CreateCommunity: (
		ctx: DispatchContext<CreateCommunityParams, CreateCommunityResponseResult>,
	) => Promise<CreateCommunityResponseResult>;
	ReadCommunity: (
		ctx: DispatchContext<ReadCommunityParams, ReadCommunityResponseResult>,
	) => Promise<ReadCommunityResponseResult>;
	ReadCommunities: (
		ctx: DispatchContext<ReadCommunitiesParams, ReadCommunitiesResponseResult>,
	) => Promise<ReadCommunitiesResponseResult>;
	UpdateCommunitySettings: (
		ctx: DispatchContext<UpdateCommunitySettingsParams, UpdateCommunitySettingsResponseResult>,
	) => Promise<UpdateCommunitySettingsResponseResult>;
	CreatePersona: (
		ctx: DispatchContext<CreatePersonaParams, CreatePersonaResponseResult>,
	) => Promise<CreatePersonaResponseResult>;
	CreateMembership: (
		ctx: DispatchContext<CreateMembershipParams, CreateMembershipResponseResult>,
	) => Promise<CreateMembershipResponseResult>;
	DeleteMembership: (
		ctx: DispatchContext<DeleteMembershipParams, DeleteMembershipResponseResult>,
	) => Promise<DeleteMembershipResponseResult>;
	CreateSpace: (
		ctx: DispatchContext<CreateSpaceParams, CreateSpaceResponseResult>,
	) => Promise<CreateSpaceResponseResult>;
	ReadSpace: (
		ctx: DispatchContext<ReadSpaceParams, ReadSpaceResponseResult>,
	) => Promise<ReadSpaceResponseResult>;
	ReadSpaces: (
		ctx: DispatchContext<ReadSpacesParams, ReadSpacesResponseResult>,
	) => Promise<ReadSpacesResponseResult>;
	DeleteSpace: (
		ctx: DispatchContext<DeleteSpaceParams, DeleteSpaceResponseResult>,
	) => Promise<DeleteSpaceResponseResult>;
	CreateFile: (
		ctx: DispatchContext<CreateFileParams, CreateFileResponseResult>,
	) => Promise<CreateFileResponseResult>;
	ReadFiles: (
		ctx: DispatchContext<ReadFilesParams, ReadFilesResponseResult>,
	) => Promise<ReadFilesResponseResult>;
	QueryFiles: (ctx: DispatchContext<QueryFilesParams, void>) => Readable<Readable<File>[]>;
	ping: (ctx: DispatchContext<PingParams, PingResponseResult>) => Promise<ApiResult<null>>;
	ToggleMainNav: (ctx: DispatchContext<ToggleMainNavParams, void>) => void;
	ToggleSecondaryNav: (ctx: DispatchContext<ToggleSecondaryNavParams, void>) => void;
	SetMobile: (ctx: DispatchContext<SetMobileParams, void>) => void;
	SelectPersona: (ctx: DispatchContext<SelectPersonaParams, void>) => void;
	SelectCommunity: (ctx: DispatchContext<SelectCommunityParams, void>) => void;
	SelectSpace: (ctx: DispatchContext<SelectSpaceParams, void>) => void;
}

// generated by src/lib/app/eventTypes.gen.ts
