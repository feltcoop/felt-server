import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';

export const toName = (entity: null | undefined | {name?: string}): string =>
	(entity as any)?.name ?? GUEST_PERSONA_NAME;

export const toIcon = (entity: null | undefined | {icon?: string}): string | null =>
	(entity as any)?.icon ?? null;
