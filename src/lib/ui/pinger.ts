import type {Dispatch} from '$lib/ui/events';

export const PINGER_INTERVAL = 300000;

export const createPinger = (dispatch: Dispatch) => {
	const interval = setInterval(async () => {
		await dispatch('ping');
	}, PINGER_INTERVAL);
	return {
		close: () => {
			clearInterval(interval);
		},
	};
};
