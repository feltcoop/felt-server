import type {Space} from '$lib/spaces/space.js';
import type {Member} from '$lib/members/member.js';

export interface Community {
	community_id?: number;
	name: string;
	spaces: Space[];
	members: Member[];
}
