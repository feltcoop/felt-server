// generated by src/lib/app/eventTypes.gen.ts

import type {SvelteComponent} from 'svelte';
import type {Readable} from '@feltcoop/svelte-gettable-stores';

import type {ApiResult} from '$lib/server/api';
import type {Service} from '$lib/server/service';
import type {Community} from '$lib/vocab/community/community';
import type {Persona, AccountPersona} from '$lib/vocab/persona/persona';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Tie} from '$lib/vocab/tie/tie';
import type {EntityData, DirectoryEntityData} from '$lib/vocab/entity/entityData';
import type {DispatchContext} from '$lib/app/dispatch';

/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/array-type */

export type ServiceEventName =
	| 'Login'
	| 'Logout'
	| 'CreateCommunity'
	| 'ReadCommunity'
	| 'ReadCommunities'
	| 'UpdateCommunitySettings'
	| 'DeleteCommunity'
	| 'CreateAccountPersona'
	| 'ReadPersona'
	| 'CreateMembership'
	| 'DeleteMembership'
	| 'CreateSpace'
	| 'ReadSpace'
	| 'ReadSpaces'
	| 'UpdateSpace'
	| 'DeleteSpace'
	| 'CreateEntity'
	| 'UpdateEntity'
	| 'ReadEntities'
	| 'ReadEntitiesPaginated'
	| 'EraseEntities'
	| 'DeleteEntities'
	| 'CreateTie'
	| 'ReadTies'
	| 'DeleteTie'
	| 'Ping';

export type ClientEventName =
	| 'SetSession'
	| 'QueryEntities'
	| 'ToggleMainNav'
	| 'ToggleSecondaryNav'
	| 'SetMobile'
	| 'OpenDialog'
	| 'CloseDialog'
	| 'SelectPersona'
	| 'SelectCommunity'
	| 'SelectSpace'
	| 'ViewSpace'
	| 'ClearFreshness';

export interface EventParamsByName {
	SetSession: SetSessionParams;
	Login: LoginParams;
	Logout: LogoutParams;
	CreateCommunity: CreateCommunityParams;
	ReadCommunity: ReadCommunityParams;
	ReadCommunities: ReadCommunitiesParams;
	UpdateCommunitySettings: UpdateCommunitySettingsParams;
	DeleteCommunity: DeleteCommunityParams;
	CreateAccountPersona: CreateAccountPersonaParams;
	ReadPersona: ReadPersonaParams;
	CreateMembership: CreateMembershipParams;
	DeleteMembership: DeleteMembershipParams;
	CreateSpace: CreateSpaceParams;
	ReadSpace: ReadSpaceParams;
	ReadSpaces: ReadSpacesParams;
	UpdateSpace: UpdateSpaceParams;
	DeleteSpace: DeleteSpaceParams;
	CreateEntity: CreateEntityParams;
	UpdateEntity: UpdateEntityParams;
	ReadEntities: ReadEntitiesParams;
	ReadEntitiesPaginated: ReadEntitiesPaginatedParams;
	QueryEntities: QueryEntitiesParams;
	EraseEntities: EraseEntitiesParams;
	DeleteEntities: DeleteEntitiesParams;
	CreateTie: CreateTieParams;
	ReadTies: ReadTiesParams;
	DeleteTie: DeleteTieParams;
	Ping: PingParams;
	ToggleMainNav: ToggleMainNavParams;
	ToggleSecondaryNav: ToggleSecondaryNavParams;
	SetMobile: SetMobileParams;
	OpenDialog: OpenDialogParams;
	CloseDialog: CloseDialogParams;
	SelectPersona: SelectPersonaParams;
	SelectCommunity: SelectCommunityParams;
	SelectSpace: SelectSpaceParams;
	ViewSpace: ViewSpaceParams;
	ClearFreshness: ClearFreshnessParams;
}
export interface EventResponseByName {
	Login: LoginResponse;
	Logout: LogoutResponse;
	CreateCommunity: CreateCommunityResponse;
	ReadCommunity: ReadCommunityResponse;
	ReadCommunities: ReadCommunitiesResponse;
	UpdateCommunitySettings: UpdateCommunitySettingsResponse;
	DeleteCommunity: DeleteCommunityResponse;
	CreateAccountPersona: CreateAccountPersonaResponse;
	ReadPersona: ReadPersonaResponse;
	CreateMembership: CreateMembershipResponse;
	DeleteMembership: DeleteMembershipResponse;
	CreateSpace: CreateSpaceResponse;
	ReadSpace: ReadSpaceResponse;
	ReadSpaces: ReadSpacesResponse;
	UpdateSpace: UpdateSpaceResponse;
	DeleteSpace: DeleteSpaceResponse;
	CreateEntity: CreateEntityResponse;
	UpdateEntity: UpdateEntityResponse;
	ReadEntities: ReadEntitiesResponse;
	ReadEntitiesPaginated: ReadEntitiesPaginatedResponse;
	EraseEntities: EraseEntitiesResponse;
	DeleteEntities: DeleteEntitiesResponse;
	CreateTie: CreateTieResponse;
	ReadTies: ReadTiesResponse;
	DeleteTie: DeleteTieResponse;
	Ping: PingResponse;
}

export interface ServiceByName {
	Ping: Service<PingParams, PingResponseResult>;
	Login: Service<LoginParams, LoginResponseResult>;
	Logout: Service<LogoutParams, LogoutResponseResult>;
	CreateAccountPersona: Service<CreateAccountPersonaParams, CreateAccountPersonaResponseResult>;
	ReadPersona: Service<ReadPersonaParams, ReadPersonaResponseResult>;
	CreateCommunity: Service<CreateCommunityParams, CreateCommunityResponseResult>;
	CreateMembership: Service<CreateMembershipParams, CreateMembershipResponseResult>;
	DeleteMembership: Service<DeleteMembershipParams, DeleteMembershipResponseResult>;
	CreateSpace: Service<CreateSpaceParams, CreateSpaceResponseResult>;
	CreateEntity: Service<CreateEntityParams, CreateEntityResponseResult>;
	UpdateEntity: Service<UpdateEntityParams, UpdateEntityResponseResult>;
	EraseEntities: Service<EraseEntitiesParams, EraseEntitiesResponseResult>;
	DeleteEntities: Service<DeleteEntitiesParams, DeleteEntitiesResponseResult>;
	ReadCommunity: Service<ReadCommunityParams, ReadCommunityResponseResult>;
	ReadCommunities: Service<ReadCommunitiesParams, ReadCommunitiesResponseResult>;
	UpdateCommunitySettings: Service<
		UpdateCommunitySettingsParams,
		UpdateCommunitySettingsResponseResult
	>;
	DeleteCommunity: Service<DeleteCommunityParams, DeleteCommunityResponseResult>;
	ReadSpace: Service<ReadSpaceParams, ReadSpaceResponseResult>;
	ReadSpaces: Service<ReadSpacesParams, ReadSpacesResponseResult>;
	ReadEntities: Service<ReadEntitiesParams, ReadEntitiesResponseResult>;
	ReadEntitiesPaginated: Service<ReadEntitiesPaginatedParams, ReadEntitiesPaginatedResponseResult>;
	UpdateSpace: Service<UpdateSpaceParams, UpdateSpaceResponseResult>;
	DeleteSpace: Service<DeleteSpaceParams, DeleteSpaceResponseResult>;
	CreateTie: Service<CreateTieParams, CreateTieResponseResult>;
	ReadTies: Service<ReadTiesParams, ReadTiesResponseResult>;
	DeleteTie: Service<DeleteTieParams, DeleteTieResponseResult>;
}

export interface SetSessionParams {
	session: ClientSession;
}

export interface LoginParams {
	username: string;
	password: string;
}
export interface LoginResponse {
	session: ClientAccountSession;
}
export type LoginResponseResult = ApiResult<LoginResponse>;

export type LogoutParams = null;
export type LogoutResponse = null;
export type LogoutResponseResult = ApiResult<LogoutResponse>;

export interface CreateCommunityParams {
	name: string;
	persona_id: number;
	settings?: {
		hue: number;
	};
}
export interface CreateCommunityResponse {
	community: Community;
	spaces: Space[];
	memberships: Membership[];
	communityPersona: Persona;
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

export interface DeleteCommunityParams {
	community_id: number;
}
export type DeleteCommunityResponse = null;
export type DeleteCommunityResponseResult = ApiResult<DeleteCommunityResponse>;

export interface CreateAccountPersonaParams {
	name: string;
}
export interface CreateAccountPersonaResponse {
	persona: AccountPersona;
	community: Community;
	spaces: Space[];
	membership: Membership;
}
export type CreateAccountPersonaResponseResult = ApiResult<CreateAccountPersonaResponse>;

export interface ReadPersonaParams {
	persona_id: number;
}
export interface ReadPersonaResponse {
	persona: Persona;
}
export type ReadPersonaResponseResult = ApiResult<ReadPersonaResponse>;

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
	persona_id: number;
	community_id: number;
	name: string;
	url: string;
	icon: string;
	view: string;
}
export interface CreateSpaceResponse {
	space: Space;
	directory: Entity & {data: DirectoryEntityData};
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

export interface UpdateSpaceParams {
	space_id: number;
	name?: string;
	url?: string;
	icon?: string;
	view?: string;
}
export interface UpdateSpaceResponse {
	space: Space;
}
export type UpdateSpaceResponseResult = ApiResult<UpdateSpaceResponse>;

export interface DeleteSpaceParams {
	space_id: number;
}
export interface DeleteSpaceResponse {
	deletedEntityIds: number[];
}
export type DeleteSpaceResponseResult = ApiResult<DeleteSpaceResponse>;

export interface CreateEntityParams {
	persona_id: number;
	data: EntityData;
	source_id: number;
	type?: string;
}
export interface CreateEntityResponse {
	entity: Entity;
	tie: Tie;
}
export type CreateEntityResponseResult = ApiResult<CreateEntityResponse>;

export interface UpdateEntityParams {
	entity_id: number;
	data: EntityData | null;
}
export interface UpdateEntityResponse {
	entity: Entity;
}
export type UpdateEntityResponseResult = ApiResult<UpdateEntityResponse>;

export interface ReadEntitiesParams {
	source_id: number;
}
export interface ReadEntitiesResponse {
	entities: Entity[];
	ties: Tie[];
}
export type ReadEntitiesResponseResult = ApiResult<ReadEntitiesResponse>;

export interface ReadEntitiesPaginatedParams {
	source_id: number;
	pageSize?: number;
	pageKey?: number;
}
export interface ReadEntitiesPaginatedResponse {
	entities: Entity[];
	ties: Tie[];
}
export type ReadEntitiesPaginatedResponseResult = ApiResult<ReadEntitiesPaginatedResponse>;

export interface QueryEntitiesParams {
	source_id: number;
}

export interface EraseEntitiesParams {
	entityIds: number[];
}
export interface EraseEntitiesResponse {
	entities: Entity[];
}
export type EraseEntitiesResponseResult = ApiResult<EraseEntitiesResponse>;

export interface DeleteEntitiesParams {
	entityIds: number[];
}
export interface DeleteEntitiesResponse {
	deletedEntityIds: number[];
}
export type DeleteEntitiesResponseResult = ApiResult<DeleteEntitiesResponse>;

export interface CreateTieParams {
	source_id: number;
	dest_id: number;
	type: string;
}
export interface CreateTieResponse {
	tie: Tie;
}
export type CreateTieResponseResult = ApiResult<CreateTieResponse>;

export interface ReadTiesParams {
	source_id: number;
}
export interface ReadTiesResponse {
	ties: Tie[];
}
export type ReadTiesResponseResult = ApiResult<ReadTiesResponse>;

export interface DeleteTieParams {
	source_id: number;
	dest_id: number;
	type: string;
}
export type DeleteTieResponse = null;
export type DeleteTieResponseResult = ApiResult<DeleteTieResponse>;

export type PingParams = null;
export type PingResponse = null;
export type PingResponseResult = ApiResult<PingResponse>;

export type ToggleMainNavParams = void;

export type ToggleSecondaryNavParams = void;

export type SetMobileParams = boolean;

export interface OpenDialogParams {
	Component: typeof SvelteComponent;
	props?: {
		[k: string]: unknown;
	};
	dialogProps?: {
		[k: string]: unknown;
	};
}

export type CloseDialogParams = void;

export interface SelectPersonaParams {
	persona_id: number;
}

export interface SelectCommunityParams {
	community_id: number | null;
}

export interface SelectSpaceParams {
	community_id: number;
	space_id: number | null;
}

export interface ViewSpaceParams {
	space_id: number;
	view: string | null;
}

export interface ClearFreshnessParams {
	directory_id: number;
}

export interface Dispatch {
	SetSession: (params: SetSessionParams) => void;
	Login: (params: LoginParams) => Promise<LoginResponseResult>;
	Logout: () => Promise<LogoutResponseResult>;
	CreateCommunity: (params: CreateCommunityParams) => Promise<CreateCommunityResponseResult>;
	ReadCommunity: (params: ReadCommunityParams) => Promise<ReadCommunityResponseResult>;
	ReadCommunities: (params: ReadCommunitiesParams) => Promise<ReadCommunitiesResponseResult>;
	UpdateCommunitySettings: (
		params: UpdateCommunitySettingsParams,
	) => Promise<UpdateCommunitySettingsResponseResult>;
	DeleteCommunity: (params: DeleteCommunityParams) => Promise<DeleteCommunityResponseResult>;
	CreateAccountPersona: (
		params: CreateAccountPersonaParams,
	) => Promise<CreateAccountPersonaResponseResult>;
	ReadPersona: (params: ReadPersonaParams) => Promise<ReadPersonaResponseResult>;
	CreateMembership: (params: CreateMembershipParams) => Promise<CreateMembershipResponseResult>;
	DeleteMembership: (params: DeleteMembershipParams) => Promise<DeleteMembershipResponseResult>;
	CreateSpace: (params: CreateSpaceParams) => Promise<CreateSpaceResponseResult>;
	ReadSpace: (params: ReadSpaceParams) => Promise<ReadSpaceResponseResult>;
	ReadSpaces: (params: ReadSpacesParams) => Promise<ReadSpacesResponseResult>;
	UpdateSpace: (params: UpdateSpaceParams) => Promise<UpdateSpaceResponseResult>;
	DeleteSpace: (params: DeleteSpaceParams) => Promise<DeleteSpaceResponseResult>;
	CreateEntity: (params: CreateEntityParams) => Promise<CreateEntityResponseResult>;
	UpdateEntity: (params: UpdateEntityParams) => Promise<UpdateEntityResponseResult>;
	ReadEntities: (params: ReadEntitiesParams) => Promise<ReadEntitiesResponseResult>;
	ReadEntitiesPaginated: (
		params: ReadEntitiesPaginatedParams,
	) => Promise<ReadEntitiesPaginatedResponseResult>;
	QueryEntities: (params: QueryEntitiesParams) => Readable<Readable<Entity>[]>;
	EraseEntities: (params: EraseEntitiesParams) => Promise<EraseEntitiesResponseResult>;
	DeleteEntities: (params: DeleteEntitiesParams) => Promise<DeleteEntitiesResponseResult>;
	CreateTie: (params: CreateTieParams) => Promise<CreateTieResponseResult>;
	ReadTies: (params: ReadTiesParams) => Promise<ReadTiesResponseResult>;
	DeleteTie: (params: DeleteTieParams) => Promise<DeleteTieResponseResult>;
	Ping: () => Promise<ApiResult<null>>;
	ToggleMainNav: (params: ToggleMainNavParams) => void;
	ToggleSecondaryNav: (params: ToggleSecondaryNavParams) => void;
	SetMobile: (params: SetMobileParams) => void;
	OpenDialog: (params: OpenDialogParams) => void;
	CloseDialog: (params: CloseDialogParams) => void;
	SelectPersona: (params: SelectPersonaParams) => void;
	SelectCommunity: (params: SelectCommunityParams) => void;
	SelectSpace: (params: SelectSpaceParams) => void;
	ViewSpace: (params: ViewSpaceParams) => void;
	ClearFreshness: (params: ClearFreshnessParams) => void;
}

export interface Mutations {
	SetSession: (ctx: DispatchContext<SetSessionParams, void>) => void;
	Login: (ctx: DispatchContext<LoginParams, LoginResponseResult>) => Promise<LoginResponseResult>;
	Logout: (
		ctx: DispatchContext<LogoutParams, LogoutResponseResult>,
	) => Promise<LogoutResponseResult>;
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
	DeleteCommunity: (
		ctx: DispatchContext<DeleteCommunityParams, DeleteCommunityResponseResult>,
	) => Promise<DeleteCommunityResponseResult>;
	CreateAccountPersona: (
		ctx: DispatchContext<CreateAccountPersonaParams, CreateAccountPersonaResponseResult>,
	) => Promise<CreateAccountPersonaResponseResult>;
	ReadPersona: (
		ctx: DispatchContext<ReadPersonaParams, ReadPersonaResponseResult>,
	) => Promise<ReadPersonaResponseResult>;
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
	UpdateSpace: (
		ctx: DispatchContext<UpdateSpaceParams, UpdateSpaceResponseResult>,
	) => Promise<UpdateSpaceResponseResult>;
	DeleteSpace: (
		ctx: DispatchContext<DeleteSpaceParams, DeleteSpaceResponseResult>,
	) => Promise<DeleteSpaceResponseResult>;
	CreateEntity: (
		ctx: DispatchContext<CreateEntityParams, CreateEntityResponseResult>,
	) => Promise<CreateEntityResponseResult>;
	UpdateEntity: (
		ctx: DispatchContext<UpdateEntityParams, UpdateEntityResponseResult>,
	) => Promise<UpdateEntityResponseResult>;
	ReadEntities: (
		ctx: DispatchContext<ReadEntitiesParams, ReadEntitiesResponseResult>,
	) => Promise<ReadEntitiesResponseResult>;
	ReadEntitiesPaginated: (
		ctx: DispatchContext<ReadEntitiesPaginatedParams, ReadEntitiesPaginatedResponseResult>,
	) => Promise<ReadEntitiesPaginatedResponseResult>;
	QueryEntities: (ctx: DispatchContext<QueryEntitiesParams, void>) => Readable<Readable<Entity>[]>;
	EraseEntities: (
		ctx: DispatchContext<EraseEntitiesParams, EraseEntitiesResponseResult>,
	) => Promise<EraseEntitiesResponseResult>;
	DeleteEntities: (
		ctx: DispatchContext<DeleteEntitiesParams, DeleteEntitiesResponseResult>,
	) => Promise<DeleteEntitiesResponseResult>;
	CreateTie: (
		ctx: DispatchContext<CreateTieParams, CreateTieResponseResult>,
	) => Promise<CreateTieResponseResult>;
	ReadTies: (
		ctx: DispatchContext<ReadTiesParams, ReadTiesResponseResult>,
	) => Promise<ReadTiesResponseResult>;
	DeleteTie: (
		ctx: DispatchContext<DeleteTieParams, DeleteTieResponseResult>,
	) => Promise<DeleteTieResponseResult>;
	Ping: (ctx: DispatchContext<PingParams, PingResponseResult>) => Promise<ApiResult<null>>;
	ToggleMainNav: (ctx: DispatchContext<ToggleMainNavParams, void>) => void;
	ToggleSecondaryNav: (ctx: DispatchContext<ToggleSecondaryNavParams, void>) => void;
	SetMobile: (ctx: DispatchContext<SetMobileParams, void>) => void;
	OpenDialog: (ctx: DispatchContext<OpenDialogParams, void>) => void;
	CloseDialog: (ctx: DispatchContext<CloseDialogParams, void>) => void;
	SelectPersona: (ctx: DispatchContext<SelectPersonaParams, void>) => void;
	SelectCommunity: (ctx: DispatchContext<SelectCommunityParams, void>) => void;
	SelectSpace: (ctx: DispatchContext<SelectSpaceParams, void>) => void;
	ViewSpace: (ctx: DispatchContext<ViewSpaceParams, void>) => void;
	ClearFreshness: (ctx: DispatchContext<ClearFreshnessParams, void>) => void;
}

// generated by src/lib/app/eventTypes.gen.ts
