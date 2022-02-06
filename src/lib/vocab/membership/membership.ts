export interface Membership {
	persona_id: number;
	community_id: number;
	created: Date;
	updated: Date | null;
}
export const MembershipSchema = {
	$id: '/schemas/Membership.json',
	type: 'object',
	properties: {
		persona_id: {type: 'number'},
		community_id: {type: 'number'},
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
	},
	required: ['persona_id', 'community_id', 'created', 'updated'],
	additionalProperties: false,
};
