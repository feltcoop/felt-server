import type {SpaceParams} from '$lib/vocab/space/space';

export const default_spaces: SpaceParams[] = [
	{
		name: 'chat',
		url: '/chat',
		media_type: 'application/fuz+json',
		content: '{"type": "Chat", "props": {"data": "/chat/files"}}',
	},
	{
		name: 'board',
		url: '/board',
		media_type: 'application/fuz+json',
		content: '{"type": "Board", "props": {"data": "/board/files"}}',
	},
	{
		name: 'forum',
		url: '/forum',
		media_type: 'application/fuz+json',
		content: '{"type": "Forum", "props": {"data": "/forum/files"}}',
	},
	{
		name: 'notes',
		url: '/notes',
		media_type: 'application/fuz+json',
		content: '{"type": "Notes", "props": {"data": "/notes/files"}}',
	},
	{
		name: 'voice',
		url: '/voice',
		media_type: 'application/fuz+json',
		content: '{"type": "Voice", "props": {"data": "/voice/stream"}}',
	},
];
