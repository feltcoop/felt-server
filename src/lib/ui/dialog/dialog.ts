import {type SvelteComponent} from 'svelte';

// TODO upstream to Felt
// TODO duplicated from event schema, generate when vocab is generated
export interface DialogState {
	Component: typeof SvelteComponent;
	props?: {[key: string]: any};
}
