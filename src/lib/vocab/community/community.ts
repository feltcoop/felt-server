import type {Space} from '$lib/vocab/space/space.js';
import type {Persona} from '$lib/vocab/persona/persona.js';

export interface Community {
	[key: string]: any; // TODO hack related to the below
	community_id: number;
	name: string;
	spaces: Space[];
	memberPersonas: Persona[]; // TODO if we normalize all data, this should be an array of ids or stores
	created: Date;
	updated: Date | null;
}
// TODO fix this type to infer `Community` like with the other schemas --
// need to handle the various kinds of `Community` doc variations we return from the database
export const CommunitySchema = {
	$id: 'https://felt.social/vocab/Community.json',
	type: 'object',
	properties: {
		community_id: {type: 'number'},
		name: {type: 'string'},
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
		// TODO this fails because Community circularly references itself via `Vocab`
		// spaces: Type.Array(Type.Ref(Vocab, {...SpaceSchema, $id: 'https://felt.social/vocab/CommunitySpaceSchema.json'})),
		// memberPersonas: Type.Array(Type.Ref(Vocab, {...PersonaSchema, $id: 'https://felt.social/vocab/CommunityPersonaSchema.json'})),
	},
	required: ['community_id', 'name', 'created', 'updated'],
	additionalProperties: true, // TODO `true` is a hack related to the above
};
