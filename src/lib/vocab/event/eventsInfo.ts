import {events as ui_events} from '$lib/ui/ui.events';
import {events as session_events} from '$lib/session/session.events';
import {events as community_events} from '$lib/vocab/community/community.events';
import {events as persona_events} from '$lib/vocab/persona/persona.events';
import {events as membership_events} from '$lib/vocab/membership/membership.events';
import {events as space_events} from '$lib/vocab/space/space.events';
import {events as file_events} from '$lib/vocab/file/file.events';
import type {EventInfo} from '$lib/vocab/event/event';

// TODO rename this module? move it?
// maybe `$lib/events.ts` or `$lib/eventsInfo.ts`
// or `$lib/vocab/event/events.ts`

export const eventsInfo: EventInfo[] = session_events.concat(
	community_events,
	persona_events,
	membership_events,
	space_events,
	file_events,
	ui_events,
);

export const eventInfoByName: Map<string, EventInfo> = new Map(eventsInfo.map((e) => [e.name, e]));
