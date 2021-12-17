import {events as ui_events} from '$lib/ui/ui.events';
import {events as session_events} from '$lib/session/session.events';
import {events as community_events} from '$lib/vocab/community/community.events';
import {events as persona_events} from '$lib/vocab/persona/persona.events';
import {events as membership_events} from '$lib/vocab/membership/membership.events';
import {events as space_events} from '$lib/vocab/space/space.events';
import {events as file_events} from '$lib/vocab/entity/entity.events';
import type {EventInfo} from '$lib/vocab/event/event';

export const eventInfos: EventInfo[] = session_events.concat(
	community_events,
	persona_events,
	membership_events,
	space_events,
	file_events,
	ui_events,
);

export const eventInfoByName: Map<string, EventInfo> = new Map(eventInfos.map((e) => [e.name, e]));
