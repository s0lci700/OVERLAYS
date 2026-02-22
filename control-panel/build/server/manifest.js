const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["icons/dice/d10.svg","icons/dice/d12.svg","icons/dice/d20.svg","icons/dice/d4.svg","icons/dice/d6.svg","icons/dice/d8.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.Cb7yhHaA.js",app:"_app/immutable/entry/app.C5ei0kFI.js",imports:["_app/immutable/entry/start.Cb7yhHaA.js","_app/immutable/chunks/BYv3Rh7F.js","_app/immutable/chunks/ab1WaRnl.js","_app/immutable/chunks/BbZTPJXo.js","_app/immutable/entry/app.C5ei0kFI.js","_app/immutable/chunks/ab1WaRnl.js","_app/immutable/chunks/Cxuf-16e.js","_app/immutable/chunks/C0gwv_6f.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/BbZTPJXo.js","_app/immutable/chunks/D5oBZPha.js","_app/immutable/chunks/BddI7m7i.js","_app/immutable/chunks/D-KA_8Fk.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-CdjPTF1b.js')),
			__memo(() => import('./chunks/1-Cst_lgk3.js')),
			__memo(() => import('./chunks/2-BSpeMBfZ.js')),
			__memo(() => import('./chunks/3-RDkfryBa.js')),
			__memo(() => import('./chunks/4-C9D9qCS_.js')),
			__memo(() => import('./chunks/5-BTmW9Gqg.js')),
			__memo(() => import('./chunks/6-DtaABWbC.js')),
			__memo(() => import('./chunks/7-DWXR3Bx3.js')),
			__memo(() => import('./chunks/8-MHaTeuSk.js')),
			__memo(() => import('./chunks/9-V0q5L4Hz.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/control/characters",
				pattern: /^\/control\/characters\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/control/dice",
				pattern: /^\/control\/dice\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/dashboard",
				pattern: /^\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/management/create",
				pattern: /^\/management\/create\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/management/manage",
				pattern: /^\/management\/manage\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 9 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
