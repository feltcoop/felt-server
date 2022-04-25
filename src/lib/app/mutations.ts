import type {Mutation} from '$lib/ui/mutation';
import {LoginAccount, LogoutAccount} from '$lib/session/sessionMutations';
import {CreateAccountPersona} from '$lib/vocab/persona/personaMutations';
import {
	CreateCommunity,
	UpdateCommunitySettings,
	DeleteCommunity,
} from '$lib/vocab/community/communityMutations';
import {CreateSpace, DeleteSpace, UpdateSpace} from '$lib/vocab/space/spaceMutations';
import {CreateMembership, DeleteMembership} from '$lib/vocab/membership/membershipMutations';
import {
	CreateEntity,
	UpdateEntity,
	EraseEntity,
	DeleteEntities,
	ReadEntities,
	QueryEntities,
} from '$lib/vocab/entity/entityMutations';
import {CreateTie, ReadTies, DeleteTie} from '$lib/vocab/tie/tieMutations';
import {
	Ping,
	SetMobile,
	OpenDialog,
	CloseDialog,
	SelectPersona,
	SelectCommunity,
	SelectSpace,
	ViewSpace,
	ToggleMainNav,
	ToggleSecondaryNav,
} from '$lib/ui/uiMutations';

export const mutations: Record<string, Mutation> = {
	// sessionMutations
	LoginAccount,
	LogoutAccount,
	// personaMutations
	CreateAccountPersona,
	// communityMutations
	CreateCommunity,
	UpdateCommunitySettings,
	DeleteCommunity,
	// spaceMutations
	CreateSpace,
	DeleteSpace,
	UpdateSpace,
	// membershipMutations
	CreateMembership,
	DeleteMembership,
	// entityMutations
	CreateEntity,
	UpdateEntity,
	EraseEntity,
	DeleteEntities,
	ReadEntities,
	QueryEntities,
	// tieMutations
	CreateTie,
	ReadTies,
	DeleteTie,
	// uiMutations
	Ping,
	SetMobile,
	OpenDialog,
	CloseDialog,
	SelectPersona,
	SelectCommunity,
	SelectSpace,
	ViewSpace,
	ToggleMainNav,
	ToggleSecondaryNav,
};
