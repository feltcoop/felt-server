import type {SpaceParams} from '$lib/vocab/space/space';
import {SpaceType} from '$lib/vocab/space/space';

export const toDefaultSpaces = (community_id: number): SpaceParams[] => [
	{
		community_id,
		name: 'home',
		url: '/',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceType.Home}", "props": {"data": "/home/files"}}`,
	},
	{
		community_id,
		name: 'room',
		url: '/room',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceType.Room}", "props": {"data": "/room/files"}}`,
	},
	{
		community_id,
		name: 'board',
		url: '/board',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceType.Board}", "props": {"data": "/board/files"}}`,
	},
	{
		community_id,
		name: 'forum',
		url: '/forum',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceType.Forum}", "props": {"data": "/forum/files"}}`,
	},
	{
		community_id,
		name: 'notes',
		url: '/notes',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceType.Notes}", "props": {"data": "/notes/files"}}`,
	},
	{
		community_id,
		name: 'voice',
		url: '/voice',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceType.Voice}", "props": {"data": "/voice/stream"}}`,
	},
	{
		community_id,
		name: 'felt library',
		url: '/library',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceType.Iframe}", "props": {"url": "https://www.felt.dev/sketch/library"}}`,
	},
	{
		community_id,
		name: 'dealt: tar',
		url: '/tar',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceType.Iframe}", "props": {"url": "https://www.dealt.dev/tar"}}`,
	},
];
