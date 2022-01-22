import {events as uiEvents} from '$lib/ui/ui.events';
import {events as accountEvents} from '$lib/vocab/account/account.events';
import {events as communityEvents} from '$lib/vocab/community/community.events';
import {events as personaEvents} from '$lib/vocab/persona/persona.events';
import {events as membershipEvents} from '$lib/vocab/membership/membership.events';
import {events as spaceEvents} from '$lib/vocab/space/space.events';
import {events as fileEvents} from '$lib/vocab/entity/entity.events';
import type {EventInfo} from '$lib/vocab/event/event';

export const eventInfos: EventInfo[] = accountEvents.concat(
	communityEvents,
	personaEvents,
	membershipEvents,
	spaceEvents,
	fileEvents,
	uiEvents,
);

export const eventInfoByName: Map<string, EventInfo> = new Map(eventInfos.map((e) => [e.name, e]));
