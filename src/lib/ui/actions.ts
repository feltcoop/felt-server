// TODO extract to felt

export interface Action<TParameters = undefined> {
	(node: HTMLElement): void | {
		update?: () => void;
		destroy?: () => void;
	};
	(node: HTMLElement, parameters: TParameters): void | {
		update?: (parameters: TParameters) => void;
		destroy?: () => void;
	};
}

export const autofocus: Action = (el) => {
	el.focus();
};
