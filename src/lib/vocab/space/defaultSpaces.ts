import type {CreateSpaceParams} from '$lib/app/eventTypes';
import type {Community} from '$lib/vocab/community/community';

export const toDefaultSpaces = ({community_id, name}: Community): CreateSpaceParams[] => [
	{
		community_id,
		name,
		url: '/',
		media_type: 'application/fuz+json',
		content: `{"type": "Home", "props": {"data": "/entities"}}`,
	},
	{
		community_id,
		name: 'room',
		url: '/room',
		media_type: 'application/fuz+json',
		content: `{"type": "Room", "props": {"data": "/entities"}}`,
	},
	{
		community_id,
		name: 'board',
		url: '/board',
		media_type: 'application/fuz+json',
		content: `{"type": "Board", "props": {"data": "/entities"}}`,
	},
	{
		community_id,
		name: 'forum',
		url: '/forum',
		media_type: 'application/fuz+json',
		content: `{"type": "Forum", "props": {"data": "/entities"}}`,
	},
	{
		community_id,
		name: 'notes',
		url: '/notes',
		media_type: 'application/fuz+json',
		content: `{"type": "Notes", "props": {"data": "/entities"}}`,
	},
	{
		community_id,
		name: 'voice',
		url: '/voice',
		media_type: 'application/fuz+json',
		content: `{"type": "Voice", "props": {"data": "/entities"}}`,
	},
	{
		community_id,
		name: 'felt library',
		url: '/library',
		media_type: 'application/fuz+json',
		content: `{"type": "Iframe", "props": {"url": "https://www.felt.dev/sketch/library"}}`,
	},
	{
		community_id,
		name: 'dealt: tar',
		url: '/tar',
		media_type: 'application/fuz+json',
		content: `{"type": "Iframe", "props": {"url": "https://www.dealt.dev/tar"}}`,
	},
];
