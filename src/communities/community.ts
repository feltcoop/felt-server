import type {Space} from '../spaces/space.js';

export interface Community {
	community_id?: number;
	name: string;
	spaces: Space[];
}
