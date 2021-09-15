// TODO typesafe non-throwing `Result`
// import type {Result} from '@feltcoop/felt';
// ) => Promise<Result<TResultMap[TMethod], ErrorResponse>>;
// import type {ErrorResponse} from '$lib/util/error';

export interface ApiClient<
	TParamsMap extends Record<string, object> = any, // TODO default type?
	TResultMap extends Record<string, object> = any, // TODO default type?
> {
	// TODO `name`?
	invoke: <TMethod extends string, TParams extends TParamsMap[TMethod]>(
		method: TMethod,
		params: TParams,
	) => Promise<TResultMap[TMethod]>;
	close: () => void;
}
