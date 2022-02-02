import type {CreateSpaceParams} from '$lib/app/eventTypes';
import type {Community} from '$lib/vocab/community/community';

export const toDefaultSpaces = ({community_id, name}: Community): CreateSpaceParams[] => [
	{
		community_id,
		name,
		url: '/',
		view: {type: 'Home', props: {data: '/entities'}},
	},
	{
		community_id,
		name: 'room',
		url: '/room',
		view: {type: 'Room', props: {data: '/entities'}},
	},
	{
		community_id,
		name: 'board',
		url: '/board',
		view: {type: 'Board', props: {data: '/entities'}},
	},
	{
		community_id,
		name: 'forum',
		url: '/forum',
		view: {type: 'Forum', props: {data: '/entities'}},
	},
	{
		community_id,
		name: 'notes',
		url: '/notes',
		view: {type: 'Notes', props: {data: '/entities'}},
	},
	{
		community_id,
		name: 'voice',
		url: '/voice',
		view: {type: 'Voice', props: {data: '/entities'}},
	},
	{
		community_id,
		name: 'felt library',
		url: '/library',
		view: {type: 'Iframe', props: {url: 'https://www.felt.dev/sketch/library'}},
	},
	{
		community_id,
		name: 'dealt: tar',
		url: '/tar',
		view: {type: 'Iframe', props: {url: 'https://www.dealt.dev/tar'}},
	},
];
