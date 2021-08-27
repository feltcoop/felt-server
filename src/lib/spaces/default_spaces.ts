import type {SpaceParams} from '$lib/spaces/space';

export const default_spaces: SpaceParams[] = [
	{
		name: 'chat',
		url: '/chat',
		media_type: 'application/fuz+json',
		content: '{"type": "Chat", "props": {"data": "/chat/posts"}}',
	},
	{
		name: 'board',
		url: '/board',
		media_type: 'application/fuz+json',
		content: '{"type": "Board", "props": {"data": "/board/posts"}}',
	},
	{
		name: 'forum',
		url: '/forum',
		media_type: 'application/fuz+json',
		content: '{"type": "Forum", "props": {"data": "/forum/posts"}}',
	},
	{
		name: 'notes',
		url: '/notes',
		media_type: 'application/fuz+json',
		content: '{"type": "Notes", "props": {"data": "/notes/posts"}}',
	},
	{
		name: 'voice',
		url: '/voice',
		media_type: 'application/fuz+json',
		content: '{"type": "Voice", "props": {"data": "/voice/stream"}}',
	},
];
