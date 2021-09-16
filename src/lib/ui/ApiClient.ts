import type {Result} from '@feltcoop/felt';

import type {ErrorResponse} from '$lib/util/error';

// TODO should `status` be passed through on error results?

// TODO typesafe non-throwing `Result`
// import type {Result} from '@feltcoop/felt';
// ) => Promise<Result<TResultMap[TServiceName], ErrorResponse>>;
// import type {ErrorResponse} from '$lib/util/error';

export type ApiResult<TData> = Result<
	{status: number; data: TData},
	ErrorResponse & {status: number}
>;

export interface ApiClient<
	TParamsMap extends Record<string, any> = any, // TODO default type?
	TResultMap extends Record<string, any> = any, // TODO default type?
> {
	// TODO `name`?
	invoke: <TServiceName extends string, TParams extends TParamsMap[TServiceName]>(
		name: TServiceName,
		params: TParams,
	) => Promise<ApiResult<TResultMap[TServiceName]>>;
	close: () => void;
}
