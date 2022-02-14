export const EntitySchema = {
	$id: '/schemas/Entity.json',
	type: 'object',
	properties: {
		entity_id: {type: 'number'},
		actor_id: {type: 'number'},
		space_id: {type: 'number'},
		data: {
			type: 'object',
			tsType: 'EntityData',
			tsImport: "import type { EntityData } from '$lib/vocab/entity/entityData';",
		},
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
	},
	required: ['entity_id', 'actor_id', 'space_id', 'data', 'created', 'updated'],
	additionalProperties: false,
};

// TODO expand to the entire vocabulary? generate if so
export type EntityType = 'Persona' | 'Community';
