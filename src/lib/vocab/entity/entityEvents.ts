import {DEFAULT_PAGE_SIZE} from '$lib/server/constants';
import type {ClientEventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateEntity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateEntity',
	broadcast: true,
	params: {
		$id: '/schemas/CreateEntityParams.json',
		type: 'object',
		properties: {
			persona_id: {type: 'number'},
			data: {type: 'object', tsType: 'EntityData'},
			source_id: {type: 'number'},
			type: {type: 'string'}, //defaults to 'HasItem'
		},
		required: ['persona_id', 'data', 'source_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateEntityResponse.json',
		type: 'object',
		properties: {
			entity: {$ref: '/schemas/Entity.json', tsType: 'Entity'},
			tie: {$ref: '/schemas/Tie.json', tsType: 'Tie'},
		},
		required: ['entity', 'tie'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateEntityResponseResult>',
	route: {
		path: '/api/v1/entities',
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
			source_id: {type: 'number'},
		},
		required: ['source_id'],
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
		path: '/api/v1/entities/source/:source_id',
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

export const ReadEntitiesPaginated: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'ReadEntitiesPaginated',
	params: {
		$id: '/schemas/ReadEntitiesPaginatedParams.json',
		type: 'object',
		properties: {
			source_id: {type: 'number'},
			pageSize: {type: 'number', maximum: DEFAULT_PAGE_SIZE},
			pageKey: {type: 'number'},
		},
		required: ['source_id'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/ReadEntitiesPaginatedResponse.json',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
			ties: {type: 'array', items: {$ref: '/schemas/Tie.json', tsType: 'Tie'}},
		},
		required: ['entities', 'ties'],
		additionalProperties: false,
	},
	returns: 'Promise<ReadEntitiesPaginatedResponseResult>',
	route: {
		path: '/api/v1/entities/source/:source_id/paginated',
		method: 'GET',
	},
};

export const EraseEntities: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'EraseEntities',
	broadcast: true,
	params: {
		$id: '/schemas/EraseEntitiesParams.json',
		type: 'object',
		properties: {
			entity_ids: {type: 'array', items: {type: 'number'}},
		},
		required: ['entity_ids'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/EraseEntitiesResponse.json',
		type: 'object',
		properties: {
			entities: {type: 'array', items: {$ref: '/schemas/Entity.json', tsType: 'Entity'}},
		},
		required: ['entities'],
		additionalProperties: false,
	},
	returns: 'Promise<EraseEntitiesResponseResult>',
	route: {
		path: '/api/v1/entities/:entity_id/erase',
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
