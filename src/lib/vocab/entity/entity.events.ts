import type {EventInfo, ClientEventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateEntity: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateEntity',
	params: {
		$id: '/schemas/CreateEntityParams.json',
		type: 'object',
		properties: {
			actor_id: {type: 'number'},
			space_id: {type: 'number'},
			data: {type: 'object', tsType: 'EntityData'},
		},
		required: ['actor_id', 'space_id', 'data'],
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
		},
		required: ['entities'],
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

export const events: EventInfo[] = [CreateEntity, ReadEntities, QueryEntities];
