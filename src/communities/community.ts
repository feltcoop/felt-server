import type {Space} from '../spaces/space.js';
import type {Member} from '../members/member.js';

export interface Community {
	community_id?: number;
	name: string;
	spaces: Space[];
	members: Member[];
}
