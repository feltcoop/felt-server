import type {EventInfo} from '$lib/vocab/event/event';
import {LoginAccount, LogoutAccount} from '$lib/vocab/account/accountEvents';
import {
	CreateCommunity,
	ReadCommunity,
	ReadCommunities,
	UpdateCommunitySettings,
} from '$lib/vocab/community/communityEvents';
import {CreateAccountPersona} from '$lib/vocab/persona/personaEvents';
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
	SoftDeleteEntity,
	HardDeleteEntity,
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
} from '$lib/ui/uiEvents';

export const eventInfos: EventInfo[] = [
	// sessionEvents
	LoginAccount,
	LogoutAccount,
	// communityEvents
	CreateCommunity,
	ReadCommunity,
	ReadCommunities,
	UpdateCommunitySettings,
	// personaEvents
	CreateAccountPersona,
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
	QueryEntities,
	SoftDeleteEntity,
	HardDeleteEntity,
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
];

export const eventInfoByName: Map<string, EventInfo> = new Map(eventInfos.map((e) => [e.name, e]));
