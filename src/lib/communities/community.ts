import type {Space} from '$lib/spaces/space.js';
import type {Member} from '$lib/members/member.js';

export interface Community {
	community_id: number;
	name: string;
	spaces: Space[];
	members: Member[];
}

export interface Community_Params {
	name: string;
}

// TODO think through alternatives to this, probably caching `members_by_id` on `data`
export interface Community_Model {
	community_id: number;
	name: string;
	spaces: Space[];
	members: Member[];
	members_by_id: Map<number, Member>;
}

export const to_community_model = (community: Community): Community_Model => ({
	...community,
	members_by_id: new Map(community.members.map((member) => [member.persona_id, member])),
});

export interface Community_Spaces {
	community_id: number;
	space_id: number;
}

export type Community_Spaces_Params = Community_Spaces;

export interface Persona_Community {
	persona_id: number;
	community_id: number;
}

export type Persona_Community_Params = Persona_Community;
