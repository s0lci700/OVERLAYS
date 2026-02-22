
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/control" | "/control/characters" | "/control/dice" | "/management" | "/management/create" | "/management/manage";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/control": Record<string, never>;
			"/control/characters": Record<string, never>;
			"/control/dice": Record<string, never>;
			"/management": Record<string, never>;
			"/management/create": Record<string, never>;
			"/management/manage": Record<string, never>
		};
		Pathname(): "/" | "/control/characters" | "/control/dice" | "/management/create" | "/management/manage";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/icons/dice/d10.svg" | "/icons/dice/d12.svg" | "/icons/dice/d20.svg" | "/icons/dice/d4.svg" | "/icons/dice/d6.svg" | "/icons/dice/d8.svg" | string & {};
	}
}