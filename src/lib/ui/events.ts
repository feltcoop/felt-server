// generated by src/lib/ui/events.gen.ts

import type {Readable} from 'svelte/store';

import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ApiResult} from '$lib/server/api';
import type {Community} from '$lib/vocab/community/community';
import type {Persona} from '$lib/vocab/persona/persona';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Space} from '$lib/vocab/space/space';
import type {File} from '$lib/vocab/file/file';
import type {DispatchContext} from '$lib/ui/api';

export interface EventsParams {
	log_in: LogInParamsType;
	log_out: LogOutParamsType;
	create_community: CreateCommunityParamsType;
	read_community: ReadCommunityParamsType;
	read_communities: ReadCommunitiesParamsType;
	create_persona: CreatePersonaParamsType;
	create_membership: CreateMembershipParamsType;
	create_space: CreateSpaceParamsType;
	read_space: ReadSpaceParamsType;
	read_spaces: ReadSpacesParamsType;
	create_file: CreateFileParamsType;
	read_files: ReadFilesParamsType;
	query_files: QueryFilesParamsType;
	toggle_main_nav: ToggleMainNavParamsType;
	toggle_secondary_nav: ToggleSecondaryNavParamsType;
	set_main_nav_view: SetMainNavViewParamsType;
	set_mobile: SetMobileParamsType;
	select_persona: SelectPersonaParamsType;
	select_community: SelectCommunityParamsType;
	select_space: SelectSpaceParamsType;
}
export interface EventsResponse {
	log_in: log_in_response_type;
	log_out: log_out_response_type;
	create_community: create_community_response_type;
	read_community: read_community_response_type;
	read_communities: read_communities_response_type;
	create_persona: create_persona_response_type;
	create_membership: create_membership_response_type;
	create_space: create_space_response_type;
	read_space: read_space_response_type;
	read_spaces: read_spaces_response_type;
	create_file: create_file_response_type;
	read_files: read_files_response_type;
}

export interface LogInParamsType {
	accountName: string;
	password: string;
}

export type LogInParamsType = null;

export type log_in_response_type = ApiResult<{session: ClientAccountSession}>;

export type LogOutParamsType = void;
export interface LogOutParamsType {
	message: string;
	[k: string]: unknown;
}

export type log_out_response_type = ApiResult<{message: string}>;

export interface CreateCommunityParamsType {
	name: string;
	persona_id: number;
}

export interface CreateCommunityParamsType {
	community: {
		community_id: number;
		name: string;
		created: {
			[k: string]: unknown;
		};
		updated: {
			[k: string]: unknown;
		} | null;
		[k: string]: unknown;
	};
}

export type create_community_response_type = ApiResult<{
	community: Community;
}>;

export interface ReadCommunityParamsType {
	community_id: number;
}

export interface ReadCommunityParamsType {
	community: {
		community_id: number;
		name: string;
		created: {
			[k: string]: unknown;
		};
		updated: {
			[k: string]: unknown;
		} | null;
		[k: string]: unknown;
	};
}

export type read_community_response_type = ApiResult<{
	community: Community;
}>;

export interface ReadCommunitiesParamsType {}

export interface ReadCommunitiesParamsType {
	communities: {
		community_id: number;
		name: string;
		created: {
			[k: string]: unknown;
		};
		updated: {
			[k: string]: unknown;
		} | null;
		[k: string]: unknown;
	}[];
}

export type read_communities_response_type = ApiResult<{
	communities: Community[];
}>;

export interface CreatePersonaParamsType {
	name: string;
}

export interface CreatePersonaParamsType {
	persona: {
		persona_id: number;
		account_id: number;
		name: string;
		icon?: string;
		community_ids: number[];
		created: {
			[k: string]: unknown;
		};
		updated: {
			[k: string]: unknown;
		} | null;
	};
	community: {
		community_id: number;
		name: string;
		created: {
			[k: string]: unknown;
		};
		updated: {
			[k: string]: unknown;
		} | null;
		[k: string]: unknown;
	};
}

export type create_persona_response_type = ApiResult<{persona: Persona; community: Community}>;

export interface CreateMembershipParamsType {
	persona_id: number;
	community_id: number;
}

export interface CreateMembershipParamsType {
	membership: {
		persona_id: number;
		community_id: number;
		created: {
			[k: string]: unknown;
		};
		updated: {
			[k: string]: unknown;
		} | null;
	};
}

export type create_membership_response_type = ApiResult<{membership: Membership}>;

export interface CreateSpaceParamsType {
	community_id: number;
	name: string;
	url: string;
	media_type: string;
	content: string;
}

export interface CreateSpaceParamsType {
	space: {
		space_id: number;
		name: string;
		url: string;
		media_type: string;
		content: string;
		created: {
			[k: string]: unknown;
		};
		updated: {
			[k: string]: unknown;
		} | null;
	};
}

export type create_space_response_type = ApiResult<{space: Space}>;

export interface ReadSpaceParamsType {
	space_id: number;
}

export interface ReadSpaceParamsType {
	space: {
		space_id: number;
		name: string;
		url: string;
		media_type: string;
		content: string;
		created: {
			[k: string]: unknown;
		};
		updated: {
			[k: string]: unknown;
		} | null;
	};
}

export type read_space_response_type = ApiResult<{space: Space}>;

export interface ReadSpacesParamsType {
	community_id: number;
}

export interface ReadSpacesParamsType {
	spaces: {
		space_id: number;
		name: string;
		url: string;
		media_type: string;
		content: string;
		created: {
			[k: string]: unknown;
		};
		updated: {
			[k: string]: unknown;
		} | null;
	}[];
}

export type read_spaces_response_type = ApiResult<{spaces: Space[]}>;

export interface CreateFileParamsType {
	actor_id: number;
	space_id: number;
	content: string;
}

export interface CreateFileParamsType {
	file: {
		file_id: number;
		actor_id: number;
		space_id: number;
		content: string;
		created: {
			[k: string]: unknown;
		};
		updated: {
			[k: string]: unknown;
		} | null;
	};
}

export type create_file_response_type = ApiResult<{file: File}>;

export interface ReadFilesParamsType {
	space_id: number;
}

export interface ReadFilesParamsType {
	files: {
		file_id: number;
		actor_id: number;
		space_id: number;
		content: string;
		created: {
			[k: string]: unknown;
		};
		updated: {
			[k: string]: unknown;
		} | null;
	}[];
}

export type read_files_response_type = ApiResult<{files: File[]}>;

export interface QueryFilesParamsType {
	space_id: number;
}

export type ToggleMainNavParamsType = void;

export type ToggleSecondaryNavParamsType = void;

export type SetMainNavViewParamsType = 'explorer' | 'account';

export type SetMobileParamsType = boolean;

export interface SelectPersonaParamsType {
	persona_id: number;
}

export interface SelectCommunityParamsType {
	community_id: number | null;
}

export interface SelectSpaceParamsType {
	community_id: number;
	space_id: number;
}

export interface Dispatch {
	(eventName: 'log_in', params: LogInParamsType): Promise<
		ApiResult<{session: ClientAccountSession}>
	>;
	(eventName: 'log_out', params: LogOutParamsType): Promise<ApiResult<{message: string}>>;
	(eventName: 'create_community', params: CreateCommunityParamsType): Promise<
		ApiResult<{
			community: Community;
		}>
	>;
	(eventName: 'read_community', params: ReadCommunityParamsType): Promise<
		ApiResult<{
			community: Community;
		}>
	>;
	(eventName: 'read_communities', params: ReadCommunitiesParamsType): Promise<
		ApiResult<{
			communities: Community[];
		}>
	>;
	(eventName: 'create_persona', params: CreatePersonaParamsType): Promise<
		ApiResult<{persona: Persona; community: Community}>
	>;
	(eventName: 'create_membership', params: CreateMembershipParamsType): Promise<
		ApiResult<{membership: Membership}>
	>;
	(eventName: 'create_space', params: CreateSpaceParamsType): Promise<ApiResult<{space: Space}>>;
	(eventName: 'read_space', params: ReadSpaceParamsType): Promise<ApiResult<{space: Space}>>;
	(eventName: 'read_spaces', params: ReadSpacesParamsType): Promise<ApiResult<{spaces: Space[]}>>;
	(eventName: 'create_file', params: CreateFileParamsType): Promise<ApiResult<{file: File}>>;
	(eventName: 'read_files', params: ReadFilesParamsType): Promise<ApiResult<{files: File[]}>>;
	(eventName: 'query_files', params: QueryFilesParamsType): Readable<Readable<File>[]>;
	(eventName: 'toggle_main_nav', params: ToggleMainNavParamsType): void;
	(eventName: 'toggle_secondary_nav', params: ToggleSecondaryNavParamsType): void;
	(eventName: 'set_main_nav_view', params: SetMainNavViewParamsType): void;
	(eventName: 'set_mobile', params: SetMobileParamsType): void;
	(eventName: 'select_persona', params: SelectPersonaParamsType): void;
	(eventName: 'select_community', params: SelectCommunityParamsType): void;
	(eventName: 'select_space', params: SelectSpaceParamsType): void;
}

export interface UiHandlers {
	log_in: (
		ctx: DispatchContext<LogInParamsType, ApiResult<{session: ClientAccountSession}>>,
	) => Promise<ApiResult<{session: ClientAccountSession}>>;
	log_out: (
		ctx: DispatchContext<LogOutParamsType, ApiResult<{message: string}>>,
	) => Promise<ApiResult<{message: string}>>;
	create_community: (
		ctx: DispatchContext<
			CreateCommunityParamsType,
			ApiResult<{
				community: Community;
			}>
		>,
	) => Promise<
		ApiResult<{
			community: Community;
		}>
	>;
	read_community: (
		ctx: DispatchContext<
			ReadCommunityParamsType,
			ApiResult<{
				community: Community;
			}>
		>,
	) => Promise<
		ApiResult<{
			community: Community;
		}>
	>;
	read_communities: (
		ctx: DispatchContext<
			ReadCommunitiesParamsType,
			ApiResult<{
				communities: Community[];
			}>
		>,
	) => Promise<
		ApiResult<{
			communities: Community[];
		}>
	>;
	create_persona: (
		ctx: DispatchContext<
			CreatePersonaParamsType,
			ApiResult<{persona: Persona; community: Community}>
		>,
	) => Promise<ApiResult<{persona: Persona; community: Community}>>;
	create_membership: (
		ctx: DispatchContext<CreateMembershipParamsType, ApiResult<{membership: Membership}>>,
	) => Promise<ApiResult<{membership: Membership}>>;
	create_space: (
		ctx: DispatchContext<CreateSpaceParamsType, ApiResult<{space: Space}>>,
	) => Promise<ApiResult<{space: Space}>>;
	read_space: (
		ctx: DispatchContext<ReadSpaceParamsType, ApiResult<{space: Space}>>,
	) => Promise<ApiResult<{space: Space}>>;
	read_spaces: (
		ctx: DispatchContext<ReadSpacesParamsType, ApiResult<{spaces: Space[]}>>,
	) => Promise<ApiResult<{spaces: Space[]}>>;
	create_file: (
		ctx: DispatchContext<CreateFileParamsType, ApiResult<{file: File}>>,
	) => Promise<ApiResult<{file: File}>>;
	read_files: (
		ctx: DispatchContext<ReadFilesParamsType, ApiResult<{files: File[]}>>,
	) => Promise<ApiResult<{files: File[]}>>;
	query_files: (ctx: DispatchContext<QueryFilesParamsType, void>) => Readable<Readable<File>[]>;
	toggle_main_nav: (ctx: DispatchContext<ToggleMainNavParamsType, void>) => void;
	toggle_secondary_nav: (ctx: DispatchContext<ToggleSecondaryNavParamsType, void>) => void;
	set_main_nav_view: (ctx: DispatchContext<SetMainNavViewParamsType, void>) => void;
	set_mobile: (ctx: DispatchContext<SetMobileParamsType, void>) => void;
	select_persona: (ctx: DispatchContext<SelectPersonaParamsType, void>) => void;
	select_community: (ctx: DispatchContext<SelectCommunityParamsType, void>) => void;
	select_space: (ctx: DispatchContext<SelectSpaceParamsType, void>) => void;
}

// generated by src/lib/ui/events.gen.ts
