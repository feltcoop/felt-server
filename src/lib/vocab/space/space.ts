export interface Space {
	space_id: number;
	name: string;
	url: string; // TODO should this be computed from the name/community? or is it more useful to cache with both the names of the space and community?
	media_type: string;
	content: string;
}

export interface SpaceParams {
	name: string;
	url: string;
	media_type: string;
	content: string;
}

//TODO make TypeScript String enum
export const SpaceTypes = {
	Chat: 'Chat',
	Board: 'Board',
	Forum: 'Forum',
	Notes: 'Notes',
	Voice: 'Voice',
	Iframe: 'Iframe',
};
