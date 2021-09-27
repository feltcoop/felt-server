import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';

export const toName = (entity: any) => (entity as any)?.name ?? GUEST_PERSONA_NAME;
export const toIcon = (entity: any) => (entity as any)?.icon ?? null;

// TODO expand to the entire vocabulary? generate if so
export type EntityType = 'Persona' | 'Community';
