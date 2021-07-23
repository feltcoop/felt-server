// TODO extract to felt

export interface Action<T_Parameters = undefined> {
	(node: HTMLElement): void | {
		update?: () => void;
		destroy?: () => void;
	};
	(node: HTMLElement, parameters: T_Parameters): void | {
		update?: (parameters: T_Parameters) => void;
		destroy?: () => void;
	};
}

export const autofocus: Action = (el) => {
	el.focus();
};
