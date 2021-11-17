import type {Dispatch} from '$lib/ui/events';

export const PINGER_INTERVAL = 300000;

export const createPinger = (dispatch: Dispatch) => {
	const interval = setInterval(async () => {
		const time = Date.now();
		await dispatch('ping');
		const duration = Date.now() - time;
		console.log('[ping]', duration + 'ms');
	}, PINGER_INTERVAL);

	return {
		close: () => {
			clearTimeout(interval);
		},
	};
};
