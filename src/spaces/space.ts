import type {OmitStrict} from '@feltcoop/gro';

export interface Space {
	space_id: number;
	url: string;
	media_type: string;
	content: string;
}

export type SpacePartial = OmitStrict<Space, 'space_id'>;
