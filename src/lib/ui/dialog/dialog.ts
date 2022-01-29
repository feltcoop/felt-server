import {type SvelteComponent} from 'svelte';

// TODO duplicated from event schema, generate when vocab is generated
export interface DialogState {
	component: typeof SvelteComponent;
	props?: {[key: string]: any};
}
