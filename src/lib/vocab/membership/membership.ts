export interface Membership {
	persona_id: number;
	community_id: number;
	name?: string;
}
export const MembershipSchema = {
	$id: 'https://felt.social/vocab/Membership.json',
	type: 'object',
	properties: {
		persona_id: {type: 'number'},
		community_id: {type: 'number'},
		name: {type: 'string'}, // TODO delete this, is returned in one query but that's now obsolete
	},
	required: ['persona_id', 'community_id'],
	additionalProperties: false,
};
