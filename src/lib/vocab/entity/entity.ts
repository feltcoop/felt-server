import {GUEST_PERSONA_NAME} from '$lib/vocab/persona/constants';
import type {EntityData} from './entityData';

export interface Entity {
	entity_id: number;
	actor_id: number;
	space_id: number;
	data: EntityData;
	created: Date;
	updated: Date | null;
}
export const EntitySchema = {
	$id: 'https://felt.social/vocab/Entity.json',
	type: 'object',
	properties: {
		entity_id: {type: 'number'},
		actor_id: {type: 'number'},
		space_id: {type: 'number'},
		data: {type: 'object', tsType: 'EntityData'},
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
	},
	required: ['entity_id', 'actor_id', 'space_id', 'data', 'created', 'updated'],
	additionalProperties: false,
};

// TODO expand to the entire vocabulary? generate if so
export type EntityType = 'Persona' | 'Community';

export const toName = (entity: null | undefined | {name?: string}): string =>
	(entity as any)?.name ?? GUEST_PERSONA_NAME;

export const toIcon = (entity: null | undefined | {icon?: string}): string | null =>
	(entity as any)?.icon ?? null;
