import type {DispatchContext} from '$lib/app/dispatch';

export interface Mutation {
	(ctx: DispatchContext<any>): any;
}
