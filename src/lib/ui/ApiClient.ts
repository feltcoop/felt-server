import type {ApiResult} from '$lib/server/api';
import type {ServiceEventInfo} from '$lib/vocab/event/event';

export interface ApiClient<
	TParamsMap extends Record<string, any> = any, // TODO default and value types?
	TResultMap extends Record<string, any> = any, // TODO default and value types?
> {
	find: (name: string) => ServiceEventInfo | undefined; // TODO custom event types
	invoke: <TServiceName extends string, TParams extends TParamsMap[TServiceName]>(
		name: TServiceName,
		params: TParams,
	) => Promise<ApiResult<TResultMap[TServiceName]>>;
	close: () => void;
}
