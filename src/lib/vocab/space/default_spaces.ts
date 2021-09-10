import type {SpaceParams} from '$lib/vocab/space/space';
import {SpaceTypes} from '$lib/vocab/space/space';

export const default_spaces: SpaceParams[] = [
	{
		name: 'chat',
		url: '/chat',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Chat}", "props": {"data": "/chat/files"}}`,
	},
	{
		name: 'board',
		url: '/board',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Board}", "props": {"data": "/board/files"}}`,
	},
	{
		name: 'forum',
		url: '/forum',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Forum}", "props": {"data": "/forum/files"}}`,
	},
	{
		name: 'notes',
		url: '/notes',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Notes}", "props": {"data": "/notes/files"}}`,
	},
	{
		name: 'voice',
		url: '/voice',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Voice}", "props": {"data": "/voice/stream"}}`,
	},
	{
		name: 'felt library',
		url: '/library',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Iframe}", "props": {"url": "https://www.felt.dev/sketch/library"}}`,
	},
	{
		name: 'dealt: tar',
		url: '/tar',
		media_type: 'application/fuz+json',
		content: `{"type": "${SpaceTypes.Iframe}", "props": {"url": "https://www.dealt.dev/tar"}}`,
	},
];
