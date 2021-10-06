import type {AnySchema} from 'ajv';

import {AccountSchema} from '$lib/vocab/account/account';
import {PersonaSchema} from '$lib/vocab/persona/persona';
import {CommunitySchema} from '$lib/vocab/community/community';
import {MembershipSchema} from '$lib/vocab/membership/membership';
import {SpaceSchema} from '$lib/vocab/space/space';
import {FileSchema} from '$lib/vocab/file/file';

// TODO generate this file?

export const entities: AnySchema[] = [
	AccountSchema,
	PersonaSchema,
	CommunitySchema,
	MembershipSchema,
	SpaceSchema,
	FileSchema,
];
