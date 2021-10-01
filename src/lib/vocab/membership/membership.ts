export interface Membership {
	persona_id: number;
	community_id: number;
	name?: string;
}
export const MembershipSchema = {
	$id: 'https://felt.social/vocab/Membership.json',
	additionalProperties: false,
	properties: {
		persona_id: {type: 'number'},
		community_id: {type: 'number'},
		name: {type: 'string'}, // TODO delete this, is returned in one query but that's now obsolete
	},
	required: ['persona_id', 'community_id'],
};

export interface MembershipParams {
	persona_id: number;
	community_id: number;
}
export const MembershipParamsSchema = {
	$id: 'https://felt.social/vocab/MembershipParams.json',
	additionalProperties: false,
	properties: {
		persona_id: {type: 'number'},
		community_id: {type: 'number'},
	},
	required: ['persona_id', 'community_id'],
};
