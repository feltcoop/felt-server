// generated by src/lib/vocab/entity/entity.schema.ts

import type {EntityData} from '$lib/vocab/entity/entityData';

export interface Entity {
	entity_id: number;
	actor_id: number;
	space_id: number;
	data: EntityData;
	created: Date;
	updated: Date | null;
}

// generated by src/lib/vocab/entity/entity.schema.ts
