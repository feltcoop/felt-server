// TODO should this be a Svelte AST? JSON-LD blocks?
export interface DialogState {
	name: string;
	props?: {[key: string]: any};
}
