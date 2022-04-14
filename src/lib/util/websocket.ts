import type {Result} from '@feltcoop/felt';

export interface BroadcastMessage {
	type: 'broadcast';
	method: string;
	result: WebsocketResult;
	params: any;
}

export interface StatusMessage {
	type: 'status';
	status: number;
	message: string;
}

export type WebsocketResult<T = any> = Result<
	{status: number; value: T},
	{status: number; message: string}
>;
