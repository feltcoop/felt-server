import type {Mutation} from '$lib/ui/mutation';
import {LoginAccount, LogoutAccount} from '$lib/session/session.mutations';
import {CreateAccountPersona} from '$lib/vocab/persona/persona.mutations';
import {CreateCommunity, UpdateCommunitySettings} from '$lib/vocab/community/community.mutations';
import {CreateSpace, DeleteSpace, UpdateSpace} from '$lib/vocab/space/space.mutations';
import {CreateMembership, DeleteMembership} from '$lib/vocab/membership/membership.mutations';
import {
	CreateEntity,
	UpdateEntity,
	SoftDeleteEntity,
	HardDeleteEntity,
	ReadEntities,
	QueryEntities,
} from '$lib/vocab/entity/entity.mutations';
import {CreateTie, ReadTies, DeleteTie} from '$lib/vocab/tie/tie.mutations';
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
} from '$lib/ui/ui.mutations';

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
