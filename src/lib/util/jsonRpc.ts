export interface JsonRpcRequest<
	TMethod extends string = string, // TODO defaults?
	TParams extends Record<TMethod, object> = any, // TODO defaults?
> {
	jsonrpc: '2.0';
	id: string;
	method: TMethod;
	params: TParams[TMethod];
}

// TODO `Response` may not be the best name, because they may not be responding to anything!
// or do we want to support multiple kinds of messages?
export interface JsonRpcResponse<TResult = any> {
	jsonrpc: '2.0';
	id: string;
	result: TResult;
}

// TODO should these check every property?
export const parseJsonRpcRequest = (msg: any): JsonRpcRequest | null =>
	msg.jsonrpc === '2.0' && msg.method ? msg : null;

export const parseJsonRpcResponse = (msg: any): JsonRpcResponse | null =>
	msg.jsonrpc === '2.0' && msg.result ? msg : null;
