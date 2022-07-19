import type {EventInfo} from '$lib/vocab/event/event';
import {Login, Logout, SetSession} from '$lib/session/sessionEvents';
import {
	CreateCommunity,
	ReadCommunity,
	ReadCommunities,
	UpdateCommunitySettings,
	DeleteCommunity,
} from '$lib/vocab/community/communityEvents';
import {CreateAccountPersona, ReadPersona} from '$lib/vocab/persona/personaEvents';
import {CreateMembership, DeleteMembership} from '$lib/vocab/membership/membershipEvents';
import {
	CreateSpace,
	ReadSpace,
	ReadSpaces,
	UpdateSpace,
	DeleteSpace,
} from '$lib/vocab/space/spaceEvents';
import {
	CreateEntity,
	UpdateEntity,
	ReadEntities,
	QueryEntities,
	EraseEntities,
	DeleteEntities,
	ReadEntitiesPaginated,
} from '$lib/vocab/entity/entityEvents';
import {CreateTie, ReadTies, DeleteTie} from '$lib/vocab/tie/tieEvents';
import {
	Ping,
	ToggleMainNav,
	ToggleSecondaryNav,
	SetMobile,
	OpenDialog,
	CloseDialog,
	SelectPersona,
	SelectCommunity,
	SelectSpace,
	ViewSpace,
	ClearFreshness,
} from '$lib/ui/uiEvents';

export const eventInfos: EventInfo[] = [
	// sessionEvents
	SetSession,
	Login,
	Logout,
	// communityEvents
	CreateCommunity,
	ReadCommunity,
	ReadCommunities,
	UpdateCommunitySettings,
	DeleteCommunity,
	// personaEvents
	CreateAccountPersona,
	ReadPersona,
	// membershipEvents
	CreateMembership,
	DeleteMembership,
	// spaceEvents
	CreateSpace,
	ReadSpace,
	ReadSpaces,
	UpdateSpace,
	DeleteSpace,
	// entityEvents
	CreateEntity,
	UpdateEntity,
	ReadEntities,
	ReadEntitiesPaginated,
	QueryEntities,
	EraseEntities,
	DeleteEntities,
	// tieEvents
	CreateTie,
	ReadTies,
	DeleteTie,
	// uiEvents
	Ping,
	ToggleMainNav,
	ToggleSecondaryNav,
	SetMobile,
	OpenDialog,
	CloseDialog,
	SelectPersona,
	SelectCommunity,
	SelectSpace,
	ViewSpace,
	ClearFreshness,
];

export const eventInfoByName: Map<string, EventInfo> = new Map(eventInfos.map((e) => [e.name, e]));
