import type {ApiResult} from '$lib/server/api';

export interface ApiClient<
	TParamsMap extends Record<string, any> = any, // TODO default and value types?
	TResultMap extends Record<string, any> = any, // TODO default and value types?
> {
	invokes: (name: string) => boolean;
	invoke: <TServiceName extends string, TParams extends TParamsMap[TServiceName]>(
		name: TServiceName,
		params: TParams,
	) => Promise<ApiResult<TResultMap[TServiceName]>>;
	close: () => void;
}
