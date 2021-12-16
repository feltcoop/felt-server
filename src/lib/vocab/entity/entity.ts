import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';

// TODO expand to the entire vocabulary? generate if so
export type EntityType = 'Persona' | 'Community';

export const toName = (entity: null | undefined | {name?: string}): string =>
	(entity as any)?.name ?? GUEST_PERSONA_NAME;

export const toIcon = (entity: null | undefined | {icon?: string}): string | null =>
	(entity as any)?.icon ?? null;
