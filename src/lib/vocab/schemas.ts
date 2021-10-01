import {AccountSchema} from '$lib/vocab/account/account';
import {PersonaSchema} from '$lib/vocab/persona/persona';
import {CommunitySchema} from '$lib/vocab/community/community';
import {MembershipSchema} from '$lib/vocab/membership/membership';
import {SpaceSchema} from '$lib/vocab/space/space';
import {FileSchema} from '$lib/vocab/file/file';

// TODO params schemas are duplicated from events -- should use them?
// or is there no such thing as these params schemas? always contextual to an event?

// TODO what about other schemas like for events?

// TODO generate this file?

export const schemas = [
	AccountSchema,
	PersonaSchema,
	CommunitySchema,
	MembershipSchema,
	SpaceSchema,
	FileSchema,
];
