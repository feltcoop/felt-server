import {writable} from 'svelte/store';

export interface Message_State {
	id: string;
	type: 'Create';
	attributed_to: string;
	object: {
		type: 'Message';
		content: string;
	};
}

// TODO export a pure creator function instead of this global
// TODO custom store probably, but how generic?
export const messages = writable<Message_State[]>([]);
