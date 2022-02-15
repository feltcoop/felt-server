export const TieSchema = {
	$id: '/schemas/Tie.json',
	type: 'object',
	properties: {
		source_id: {type: 'number'},
		destination_id: {type: 'number'},
		type: {type: 'string'},
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
	},
	required: ['source_id', 'destination_id', 'type', 'created', 'updated'],
	additionalProperties: false,
};
