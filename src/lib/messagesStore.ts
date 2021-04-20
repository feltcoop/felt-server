import {writable} from 'svelte/store';

// TODO ActivityStreams
export interface MessageState {
	id: string;
	type: 'Create';
	attributedTo: string;
	object: {
		type: 'Message';
		content: string;
	};
}

// TODO export a pure creator function instead of this global
// TODO custom store probably, but how generic?
export const messages = writable<MessageState[]>([]);
