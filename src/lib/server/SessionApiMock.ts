import type {ISessionApi} from '$lib/server/SessionApi';

export class SessionApiMock implements ISessionApi {
	login(/*account_id: number*/) {
		// TODO set state to test mock?
	}
	logout() {
		// TODO set state to test mock?
	}
}
