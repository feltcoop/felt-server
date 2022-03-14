import {parseView} from '$lib/vocab/view/view';
import type {CreateSpaceParams} from '$lib/app/eventTypes';
import type {Community} from '$lib/vocab/community/community';

export const toDefaultSpaces = ({community_id, name}: Community): CreateSpaceParams[] => [
	{
		community_id,
		name,
		url: '/',
		view: parseView('<Home />'),
	},
	{
		community_id,
		name: 'room',
		url: '/room',
		view: parseView('<Room />'),
	},
	{
		community_id,
		name: 'board',
		url: '/board',
		view: parseView('<Board />'),
	},
	{
		community_id,
		name: 'forum',
		url: '/forum',
		view: parseView('<Forum />'),
	},
	{
		community_id,
		name: 'notes',
		url: '/notes',
		view: parseView('<Notes />'),
	},
	{
		community_id,
		name: 'voice',
		url: '/voice',
		view: parseView('<Voice />'),
	},
	{
		community_id,
		name: 'felt library',
		url: '/library',
		view: parseView('<Iframe src="https://www.felt.dev/sketch/library" />'),
	},
	{
		community_id,
		name: 'dealt: tar',
		url: '/tar',
		view: parseView('<Iframe src="https://www.dealt.dev/tar" />'),
	},
];
