import type {Space} from '$lib/vocab/space/space.js';
import type {Member} from '$lib/vocab/member/member.js';

export interface Community {
	community_id: number;
	name: string;
	spaces: Space[];
	members: Member[];
}

export interface CommunityParams {
	name: string;
}

// TODO think through alternatives to this, probably caching `members_by_id` on `data`
export interface CommunityModel {
	community_id: number;
	name: string;
	spaces: Space[];
	members: Member[];
	members_by_id: Map<number, Member>;
}

export const to_community_model = (community: Community): CommunityModel => ({
	...community,
	members_by_id: new Map(community.members.map((member) => [member.persona_id, member])),
});

export interface CommunitySpaces {
	community_id: number;
	space_id: number;
}

export type CommunitySpacesParams = CommunitySpaces;

export interface PersonaCommunity {
	persona_id: number;
	community_id: number;
}

export type PersonaCommunityParams = PersonaCommunity;
