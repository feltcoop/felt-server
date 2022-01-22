import type {IServiceEffects} from '$lib/server/ServiceEffects';

export class ServiceEffectsMock implements IServiceEffects {
	login(/*account_id: number*/) {
		// TODO set state to test mock?
	}
	logout() {
		// TODO set state to test mock?
	}
}
