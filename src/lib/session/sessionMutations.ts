import type {Mutations} from '$lib/app/eventTypes';

export const LoginAccount: Mutations['LoginAccount'] = async ({invoke, ui: {session}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	session.set(result.value.session);
	return result;
};

export const LogoutAccount: Mutations['LogoutAccount'] = async ({invoke, ui: {session}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	session.set({guest: true});
	return result;
};
