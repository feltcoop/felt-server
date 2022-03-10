import type {Result} from '@feltcoop/felt';

export const ICON_MISSING_ERROR = 'please add an icon, any character including emoji';
export const ICON_TOO_LONG_ERROR = 'icon must be exactly 1 character';

// TODO look into using ajv or zod for parsing
export const parseSpaceIcon = (value: string): Result<{value: string}, {message: string}> => {
	if (!value) return {ok: false, message: ICON_MISSING_ERROR};
	const length = [...value].length;
	if (length > 1) return {ok: false, message: ICON_TOO_LONG_ERROR};
	return {ok: true, value};
};
