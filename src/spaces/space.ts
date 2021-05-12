import type {PartialOnly} from '@feltcoop/gro';

export interface Space {
	space_id: number;
	url: string;
	media_type: string;
	content: string;
}

export type SpacePartial = PartialOnly<Space, 'space_id'>;
