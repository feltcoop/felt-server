// TODO extract to felt

export interface Action<TParameters = undefined> {
	(node: HTMLElement, parameters?: TParameters):
		| undefined
		| {
				update?: (parameters?: TParameters) => void;
				destroy?: () => void;
		  };
}

export const autofocus: Action = (el): undefined => {
	el.focus();
	return; // makes TypeScript happy because `void` doesn't work in a union -- is there a better way?
};
