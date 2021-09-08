import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';

export interface File {
	file_id: number;
	actor_id: number;
	space_id: number;
	content: string;
}

export type FileParams = Static<typeof FileParamsSchema>;
export const FileParamsSchema = Type.Object(
	{
		actor_id: Type.Number(), // `persona_id` -- must be validated against the authenticated `account_id`
		space_id: Type.Number(),
		content: Type.String(),
	},
	// {additionalProperties: false}, // TODO how to use this with Type.Intersect?
);
