import {randomHue} from '$lib/ui/color';
import type {Persona} from '$lib/vocab/persona/persona.js';

// TODO generate types: export interface CommunitySettings
export const CommunitySettingsSchema = {
	type: 'object',
	properties: {
		hue: {type: 'number'},
	},
	required: ['hue'],
	additionalProperties: false,
};

export const toDefaultCommunitySettings = (name: string): Community['settings'] => ({
	hue: randomHue(name),
});

export interface Community {
	community_id: number;
	type: 'standard' | 'personal';
	name: string;
	settings: {hue: number};
	memberPersonas: Persona[]; // TODO if we normalize all data, this should be an array of ids or stores
	created: Date;
	updated: Date | null;
}
// TODO fix this type to infer `Community` like with the other schemas --
// need to handle the various kinds of `Community` doc variations we return from the database
export const CommunitySchema = {
	$id: '/schemas/Community.json',
	type: 'object',
	properties: {
		community_id: {type: 'number'},
		type: {type: 'string', enum: ['standard', 'personal']},
		name: {type: 'string'},
		settings: CommunitySettingsSchema,
		created: {type: 'object', format: 'date-time', tsType: 'Date'},
		updated: {type: ['object', 'null'], format: 'date-time', tsType: 'Date | null'},
	},
	required: ['community_id', 'type', 'name', 'created', 'updated'],
	additionalProperties: true, // TODO `true` is a hack related to the above
};
