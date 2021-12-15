import {setContext, getContext, SvelteComponent} from 'svelte';

export interface ContextmenuComponents {
	[type: string]: typeof SvelteComponent;
}

const CONTEXT_MENU_COMPONENTS_KEY = Symbol();

export const setContextmenuComponents = <T extends ContextmenuComponents>(components: T): void =>
	setContext(CONTEXT_MENU_COMPONENTS_KEY, components);

export const getContextmenuComponents = <T extends ContextmenuComponents>(): T =>
	getContext(CONTEXT_MENU_COMPONENTS_KEY);
