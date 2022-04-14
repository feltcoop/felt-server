import type {Result} from '@feltcoop/felt';
import type {Json} from '@feltcoop/felt/util/json.js';

export interface BroadcastMessage {
	type: 'broadcast';
	method: string;
	result: WebsocketResult;
	params: any;
}

// TODO rename? `CommandMessage`? `ServerMessage`?
export interface StatusMessage {
	type: 'status';
	status: number;
	message: string;
}

export type WebsocketResult = Result<
	{status: number; value: Json},
	{status: number; message: string}
>;
