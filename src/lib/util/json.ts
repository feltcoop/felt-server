import type {Result} from '@feltcoop/felt';

export const parseJson = (value: string): Result<{value: object}, {message: string}> => {
	try {
		const parsed = JSON.parse(value);
		return {ok: true, value: parsed};
	} catch (err) {
		return {ok: false, message: 'invalid json'};
	}
};

export const serializeJson = (raw: any, print?: boolean): string =>
	print ? JSON.stringify(raw, null, 2) : JSON.stringify(raw);
