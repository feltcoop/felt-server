import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

export interface File extends Static<typeof FileSchema> {}
export const FileSchema = Type.Object(
	{
		file_id: Type.Number(),
		actor_id: Type.Number(),
		space_id: Type.Number(),
		content: Type.String(),
	},
	{$id: 'https://felt.social/vocab/File.json', additionalProperties: false},
);

export interface FileParams extends Static<typeof FileParamsSchema> {}
export const FileParamsSchema = Type.Object(
	{
		actor_id: Type.Number(), // `persona_id` -- must be validated against the authenticated `account_id`
		space_id: Type.Number(),
		content: Type.String(),
	},
	{$id: 'https://felt.social/vocab/FileParams.json', additionalProperties: false},
);
