export interface BroadcastMessage {
	type: 'broadcast';
	method: string;
	result: any;
	params: any;
}

// TODO rename? `CommandMessage`? `ServerMessage`?
export interface StatusMessage {
	type: 'status';
	status: number;
	message: string;
}
