import type {Result} from '@feltcoop/felt';

import type {ErrorResponse} from '$lib/util/error';

export type ApiResult<TValue> = Result<
	{status: number; value: TValue},
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
