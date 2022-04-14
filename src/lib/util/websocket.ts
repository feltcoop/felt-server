import type {Result} from '@feltcoop/felt';
import type {Json} from '@feltcoop/felt/util/json.js';

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

export type WebsocketResult<T extends Json = Json> = Result<
	{status: number; value: T},
	{status: number; message: string}
>;
