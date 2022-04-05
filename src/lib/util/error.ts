export interface ErrorResponse {
	message: string;
}

export const toClientErrorMessage = (err: Error | ClientError): string =>
	'clientMessage' in err ? err.clientMessage : 'unknown server error';

export class ClientError extends Error {
	constructor(public readonly clientMessage: string, serverMessage = clientMessage) {
		super(serverMessage);
	}
}
