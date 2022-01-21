import type {SchemaObject} from 'ajv';

import {AccountSchema} from '$lib/vocab/account/account';
import {PersonaSchema} from '$lib/vocab/persona/persona';
import {CommunitySchema} from '$lib/vocab/community/community';
import {MembershipSchema} from '$lib/vocab/membership/membership';
import {SpaceSchema} from '$lib/vocab/space/space';
import {EntitySchema} from '$lib/vocab/entity/entity';

// TODO generate this file?

export const entities: SchemaObject[] = [
	AccountSchema,
	PersonaSchema,
	CommunitySchema,
	MembershipSchema,
	SpaceSchema,
	EntitySchema,
];
