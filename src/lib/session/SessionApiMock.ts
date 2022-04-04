import type {ISessionApi} from '$lib/session/SessionApi';

export class SessionApiMock implements ISessionApi {
	login(/*account_id: number*/): void {
		// TODO set state to test mock?
	}
	logout(): void {
		// TODO set state to test mock?
	}
}
