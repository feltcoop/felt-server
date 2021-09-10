import type {SpaceParams} from '$lib/vocab/space/space';
import {SpaceTypes} from '$lib/vocab/space/space';

export const toDefaultSpaces = (community_id: number): SpaceParams[] => [
	{
		community_id,
		name: 'chat',
		url: '/chat',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Chat}", "props": {"data": "/chat/files"}}`,
	},
	{
		community_id,
		name: 'board',
		url: '/board',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Board}", "props": {"data": "/board/files"}}`,
	},
	{
		community_id,
		name: 'forum',
		url: '/forum',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Forum}", "props": {"data": "/forum/files"}}`,
	},
	{
		community_id,
		name: 'notes',
		url: '/notes',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Notes}", "props": {"data": "/notes/files"}}`,
	},
	{
		community_id,
		name: 'voice',
		url: '/voice',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Voice}", "props": {"data": "/voice/stream"}}`,
	},
	{
		community_id,
		name: 'felt library',
		url: '/library',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Iframe}", "props": {"url": "https://www.felt.dev/sketch/library"}}`,
	},
	{
		community_id,
		name: 'dealt: tar',
		url: '/tar',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Iframe}", "props": {"url": "https://www.dealt.dev/tar"}}`,
	},
];
