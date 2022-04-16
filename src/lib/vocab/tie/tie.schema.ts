export const TieSchema = {
	$id: '/schemas/Tie.json',
	type: 'object',
	properties: {
		source_id: {type: 'number'},
		dest_id: {type: 'number'},
		type: {type: 'string'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
	},
	required: ['source_id', 'dest_id', 'type', 'created'],
	additionalProperties: false,
};
