import {Type} from '@sinclair/typebox';
import type {Static} from '@sinclair/typebox';
import type {ValidateFunction} from 'ajv';

import {ajv} from '$lib/util/ajv';

export type File = Static<typeof FileSchema>;
export const FileSchema = Type.Object(
	{
		file_id: Type.Number(),
		actor_id: Type.Number(),
		space_id: Type.Number(),
		content: Type.String(),
	},
	{$id: 'File', additionalProperties: false},
);

export type FileParams = Static<typeof FileParamsSchema>;
export const FileParamsSchema = Type.Object(
	{
		actor_id: Type.Number(), // `persona_id` -- must be validated against the authenticated `account_id`
		space_id: Type.Number(),
		content: Type.String(),
	},
	{$id: 'FileParams', additionalProperties: false},
);
export const validateFileParams = (): ValidateFunction<FileParams> =>
	_validateFileParams || (_validateFileParams = ajv.compile(FileParamsSchema));
let _validateFileParams: ValidateFunction<FileParams> | undefined;
