import type {Dispatch} from '$lib/app/eventTypes';

export const PINGER_INTERVAL = 300000;

export const createPinger = (dispatch: Dispatch) => {
	const interval = setInterval(async () => {
		await dispatch('ping', null); // TODO make this `void` not `null`
	}, PINGER_INTERVAL);
	return {
		close: () => {
			clearInterval(interval);
		},
	};
};
