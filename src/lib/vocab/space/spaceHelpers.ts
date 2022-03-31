import type {Result} from '@feltcoop/felt';
import {toGraphemeCount} from '@feltcoop/felt/util/string.js';

export const ICON_MISSING_ERROR = 'please add an icon, any character including emoji';
export const ICON_TOO_LONG_ERROR = 'icon must be exactly 1 character';

// TODO move to schema for server-side validation -- `maxLength` won't work because it uses `.length`
const ICON_MAX_LENGTH = 1;

export const parseSpaceIcon = (value: string): Result<{value: string}, {message: string}> => {
	if (!value) {
		return {ok: false, message: ICON_MISSING_ERROR};
	}
	if (toGraphemeCount(value) > ICON_MAX_LENGTH) {
		return {ok: false, message: ICON_TOO_LONG_ERROR};
	}
	return {ok: true, value};
};
