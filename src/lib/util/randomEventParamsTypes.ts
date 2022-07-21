// generated by src/lib/util/randomEventParamsTypes.gen.ts

import type {RandomVocab, RandomVocabContext} from '$lib/util/randomVocab';
import type {
	SetSessionParams,
	LoginAccountParams,
	LogoutAccountParams,
	CreateCommunityParams,
	ReadCommunityParams,
	ReadCommunitiesParams,
	UpdateCommunitySettingsParams,
	DeleteCommunityParams,
	CreateAccountPersonaParams,
	ReadPersonaParams,
	CreateMembershipParams,
	DeleteMembershipParams,
	CreateSpaceParams,
	ReadSpaceParams,
	ReadSpacesParams,
	UpdateSpaceParams,
	DeleteSpaceParams,
	CreateEntityParams,
	UpdateEntityParams,
	ReadEntitiesParams,
	ReadEntitiesPaginatedParams,
	QueryEntitiesParams,
	EraseEntitiesParams,
	DeleteEntitiesParams,
	CreateTieParams,
	ReadTiesParams,
	DeleteTieParams,
	PingParams,
	ToggleMainNavParams,
	ToggleSecondaryNavParams,
	SetMobileParams,
	OpenDialogParams,
	CloseDialogParams,
	SelectPersonaParams,
	SelectCommunityParams,
	SelectSpaceParams,
	ViewSpaceParams,
	ClearFreshnessParams,
} from '$lib/app/eventTypes';

export interface RandomEventParams {
	SetSession: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SetSessionParams>;
	LoginAccount: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<LoginAccountParams>;
	LogoutAccount: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<LogoutAccountParams>;
	CreateCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateCommunityParams>;
	ReadCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadCommunityParams>;
	ReadCommunities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadCommunitiesParams>;
	UpdateCommunitySettings: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateCommunitySettingsParams>;
	DeleteCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteCommunityParams>;
	CreateAccountPersona: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateAccountPersonaParams>;
	ReadPersona: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadPersonaParams>;
	CreateMembership: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateMembershipParams>;
	DeleteMembership: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteMembershipParams>;
	CreateSpace: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateSpaceParams>;
	ReadSpace: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ReadSpaceParams>;
	ReadSpaces: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ReadSpacesParams>;
	UpdateSpace: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateSpaceParams>;
	DeleteSpace: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteSpaceParams>;
	CreateEntity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CreateEntityParams>;
	UpdateEntity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<UpdateEntityParams>;
	ReadEntities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadEntitiesParams>;
	ReadEntitiesPaginated: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ReadEntitiesPaginatedParams>;
	QueryEntities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<QueryEntitiesParams>;
	EraseEntities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<EraseEntitiesParams>;
	DeleteEntities: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<DeleteEntitiesParams>;
	CreateTie: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<CreateTieParams>;
	ReadTies: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ReadTiesParams>;
	DeleteTie: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<DeleteTieParams>;
	Ping: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<PingParams>;
	ToggleMainNav: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ToggleMainNavParams>;
	ToggleSecondaryNav: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ToggleSecondaryNavParams>;
	SetMobile: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<SetMobileParams>;
	OpenDialog: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<OpenDialogParams>;
	CloseDialog: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<CloseDialogParams>;
	SelectPersona: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<SelectPersonaParams>;
	SelectCommunity: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<SelectCommunityParams>;
	SelectSpace: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<SelectSpaceParams>;
	ViewSpace: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<ViewSpaceParams>;
	ClearFreshness: (
		random: RandomVocabContext,
		randomVocab?: RandomVocab,
	) => Promise<ClearFreshnessParams>;
}

// generated by src/lib/util/randomEventParamsTypes.gen.ts
