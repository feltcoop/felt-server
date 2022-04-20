import type {ClientEventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateEntity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateEntity',
	broadcast: true,
	params: {
		$id: '/schemas/CreateEntityParams.json',
		type: 'object',
		properties: {
			actor_id: {type: 'number'},
			space_id: {type: 'number'},
			data: {type: 'object', tsType: 'EntityData'},
			source_id: {type: 'number'},
			type: {type: 'string'},
		},
		required: ['actor_id', 'space_id', 'data', 'source_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateEntityResponse.json',
		type: 'object',
		properties: {
			entity: {$ref: '/schemas/Entity.json', tsType: 'Entity'},
		},
		required: ['entity'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateEntityResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id/entities',
		method: 'POST',
	},
};

export const UpdateEntity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'UpdateEntity',
	broadcast: true,
	params: {
		$id: '/schemas/UpdateEntityParams.json',
		type: 'object',
		properties: {
			entity_id: {type: 'number'},
			data: {type: 'object', tsType: 'EntityData'},
		},
		required: ['entity_id', 'data'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/UpdateEntityResponse.json',
		type: 'object',
		properties: {
			entity: {$ref: '/schemas/Entity.json', tsType: 'Entity'},
		},
		required: ['entity'],
		additionalProperties: false,
	},
	returns: 'Promise<UpdateEntityResponseResult>',
	route: {
		path: '/api/v1/entities/:entity_id',
		method: 'POST',
	},
};

export const ReadEntities: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadEntities',
	params: {
		$id: '/schemas/ReadEntitiesParams.json',
		type: 'object',
		properties: {
			space_id: {type: 'number'},
		},
		required: ['space_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadEntitiesResponse.json',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
			ties: {type: 'array', items: {$ref: '/schemas/Tie.json', tsType: 'Tie'}},
		},
		required: ['entities', 'ties'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadEntitiesResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id/entities',
		method: 'GET',
	},
};

// `QueryEntities` differs from `ReadEntities` in that
// it returns a reactive store containing the requested entities.
// Its API could be expanded to give callers access to its async status or promise,
// maybe via a third `options` arg with callbacks.
export const QueryEntities: ClientEventInfo = {
	type: 'ClientEvent',
	name: 'QueryEntities',
	// TODO this is saying "use `ReadEntities`'s params but for this event"
	// but it's verbose and awkward. If the pattern should stay, we could write a helper like:
	// `renameSchema(ReadEntities.params, '/schemas/QueryEntitiesResponse.json')`
	// but that only handles extending the $id, which may not be the common case.
	params: {
		...ReadEntities.params,
		$id: '/schemas/QueryEntitiesResponse.json',
	},
	// TODO Can/should this compose the `ReadEntities` event info?
	// Could make the `response` available.
	returns: 'Readable<Readable<Entity>[]>',
};

export const GetPaginatedEntities: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'GetPaginatedEntities',
	params: {
		$id: '/schemas/GetPaginatedEntitiesParams.json',
		type: 'object',
		properties: {
			directory_id: {type: 'number'},
			pageSize: {type: 'number'},
			pageKey: {type: 'number'},
		},
		required: ['directory_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/GetPaginatedEntitiesResponse.json',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
			ties: {type: 'array', items: {$ref: '/schemas/Tie.json', tsType: 'Tie'}},
		},
		required: ['entities', 'ties'],
		additionalProperties: false,
	},
	returns: 'Promise<GetPaginatedEntitiesResponseResult>',
	route: {
		path: '/api/v1/spaces/:space_id/entities',
		method: 'GET',
	},
};

export const SoftDeleteEntity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'SoftDeleteEntity',
	broadcast: true,
	params: {
		$id: '/schemas/SoftDeleteEntityParams.json',
		type: 'object',
		properties: {
			entity_id: {type: 'number'},
		},
		required: ['entity_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/SoftDeleteEntityResponse.json',
		type: 'null',
	},
	returns: 'Promise<SoftDeleteEntityResponseResult>',
	route: {
		path: '/api/v1/entities/:entity_id/soft',
		method: 'DELETE',
	},
};

export const DeleteEntities: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'DeleteEntities',
	broadcast: true,
	params: {
		$id: '/schemas/DeleteEntitiesParams.json',
		type: 'object',
		properties: {
			entity_ids: {type: 'array', items: {type: 'number'}},
		},
		required: ['entity_ids'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/DeleteEntitiesResponse.json',
		type: 'null',
	},
	returns: 'Promise<DeleteEntitiesResponseResult>',
	route: {
		path: '/api/v1/entities/delete',
		method: 'DELETE',
	},
};
