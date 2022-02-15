import type {SchemaObject} from 'ajv';

import {AccountSchema} from '$lib/vocab/account/account.schema';
import {PersonaSchema} from '$lib/vocab/persona/persona.schema';
import {CommunitySchema} from '$lib/vocab/community/community.schema';
import {MembershipSchema} from '$lib/vocab/membership/membership.schema';
import {SpaceSchema} from '$lib/vocab/space/space.schema';
import {EntitySchema} from '$lib/vocab/entity/entity.schema';
import {TieSchema} from '$lib/vocab/tie/tie.schema';

// TODO generate this file?

export const entities: SchemaObject[] = [
	AccountSchema,
	PersonaSchema,
	CommunitySchema,
	MembershipSchema,
	SpaceSchema,
	EntitySchema,
	TieSchema,
];
