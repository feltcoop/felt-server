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
