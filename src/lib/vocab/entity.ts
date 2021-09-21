import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';

/*

This is the base type shared between `Link` and `Object` in ActivityStreams 2.0:
https://ryanatkn.github.io/corpus-activity-streams/#Entity

- TODO maybe rename entity? `node`? `thing`? `ent`?

*/

export const toName = (entity: any, fallback: string = GUEST_PERSONA_NAME): string =>
	(entity as any)?.name ?? fallback;

export const toIcon = (entity: any): string | null => (entity as any)?.name ?? null;
