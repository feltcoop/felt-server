import {DialogDataSchema} from '@feltcoop/felt/ui/dialog/dialog.schema.js';
import type {VocabSchema} from '@feltcoop/gro/dist/utils/schema.js';

import {eventInfos} from '$lib/app/events';
import {AccountSchema} from '$lib/vocab/account/account.schema';
import {
	AccountPersonaSchema,
	CommunityPersonaSchema,
	PersonaSchema,
} from '$lib/vocab/persona/persona.schema';
import {CommunitySchema, CommunitySettingsSchema} from '$lib/vocab/community/community.schema';
import {MembershipSchema} from '$lib/vocab/membership/membership.schema';
import {SpaceSchema} from '$lib/vocab/space/space.schema';
import {EntitySchema} from '$lib/vocab/entity/entity.schema';
import {TieSchema} from '$lib/vocab/tie/tie.schema';

// TODO The casts to `as VocabSchema` in this file
// are needed because the `json-schema` types are very strict,
// and `as const` fails due to `readonly` properties.
// It could be fixed by declaring schemas with their type,
// e.g. `export const AccountSchema: VocabSchema = {`
// but this has the downside of losing the inferred default types,
// which are handy when the schemas are used directly.

export const schemas = [
	AccountSchema,
	AccountPersonaSchema,
	CommunityPersonaSchema,
	PersonaSchema,
	CommunitySchema,
	CommunitySettingsSchema,
	MembershipSchema,
	SpaceSchema,
	EntitySchema,
	TieSchema,
] as VocabSchema[];

schemas.push(
	...eventInfos
		.flatMap((eventInfo) => [
			eventInfo.params,
			'response' in eventInfo ? eventInfo.response : (null as any),
		])
		.filter(Boolean),
);

// Include external schema dependencies.
schemas.push(DialogDataSchema as VocabSchema);
