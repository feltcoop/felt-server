import {parse} from 'svelte-parse';

import type {CreateSpaceParams} from '$lib/app/eventTypes';
import type {Community} from '$lib/vocab/community/community';

export const toDefaultSpaces = ({community_id, name}: Community): CreateSpaceParams[] => [
	{
		community_id,
		name,
		url: '/',
		view: parse({value: '<Home />', generatePositions: false}),
	},
	{
		community_id,
		name: 'room',
		url: '/room',
		view: parse({value: '<Room />', generatePositions: false}),
	},
	{
		community_id,
		name: 'board',
		url: '/board',
		view: parse({value: '<Board />', generatePositions: false}),
	},
	{
		community_id,
		name: 'forum',
		url: '/forum',
		view: parse({value: '<Forum />', generatePositions: false}),
	},
	{
		community_id,
		name: 'notes',
		url: '/notes',
		view: parse({value: '<Notes />', generatePositions: false}),
	},
	{
		community_id,
		name: 'voice',
		url: '/voice',
		view: parse({value: '<Voice />', generatePositions: false}),
	},
	{
		community_id,
		name: 'felt library',
		url: '/library',
		view: parse({
			value: '<Iframe src="https://www.felt.dev/sketch/library" />',
			generatePositions: false,
		}),
	},
	{
		community_id,
		name: 'dealt: tar',
		url: '/tar',
		view: parse({
			value: '<Iframe src="https://www.dealt.dev/tar" /><Notes />',
			generatePositions: false,
		}),
	},
];
