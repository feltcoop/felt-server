export const MembershipSchema = {
	$id: '/schemas/Membership.json',
	type: 'object',
	properties: {
		persona_id: {type: 'number'},
		community_id: {type: 'number'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['persona_id', 'community_id', 'created', 'updated'],
	additionalProperties: false,
};
