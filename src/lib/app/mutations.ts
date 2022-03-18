import type {Mutation} from '$lib/ui/mutation';
import {LoginAccount, LogoutAccount} from '$lib/session/sessionMutations';
import {CreateAccountPersona} from '$lib/vocab/persona/personaMutations';
import {CreateCommunity, UpdateCommunitySettings} from '$lib/vocab/community/communityMutations';
import {CreateSpace, DeleteSpace, UpdateSpace} from '$lib/vocab/space/spaceMutations';
import {CreateMembership, DeleteMembership} from '$lib/vocab/membership/membershipMutations';
import {
	CreateEntity,
	UpdateEntity,
	SoftDeleteEntity,
	HardDeleteEntity,
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
	LoginAccount,
	LogoutAccount,
	CreateAccountPersona,
	CreateCommunity,
	UpdateCommunitySettings,
	CreateSpace,
	DeleteSpace,
	UpdateSpace,
	CreateMembership,
	DeleteMembership,
	CreateEntity,
	UpdateEntity,
	SoftDeleteEntity,
	HardDeleteEntity,
	ReadEntities,
	QueryEntities,
	CreateTie,
	ReadTies,
	DeleteTie,
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
