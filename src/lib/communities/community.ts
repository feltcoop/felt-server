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
	spaces: Space[];
	members: Member[];
}

export interface Community_Model {
	community_id: number;
	name: string;
	spaces: Space[];
	members: Member[];
	members_by_id: Map<number, Member>;
}
