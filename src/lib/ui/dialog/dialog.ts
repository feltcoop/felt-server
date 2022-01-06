// TODO should this be a Svelte AST? JSON-LD blocks?
// TODO duplicated from event schema
export interface DialogState {
	name: string;
	props?: {[key: string]: any};
}
