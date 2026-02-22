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
		client: {start:"_app/immutable/entry/start.BIt9lDIr.js",app:"_app/immutable/entry/app.IHE74y1p.js",imports:["_app/immutable/entry/start.BIt9lDIr.js","_app/immutable/chunks/DgxWy6MV.js","_app/immutable/chunks/BpRt2mh-.js","_app/immutable/chunks/BvwCr5sS.js","_app/immutable/entry/app.IHE74y1p.js","_app/immutable/chunks/BpRt2mh-.js","_app/immutable/chunks/CSeQF5Ga.js","_app/immutable/chunks/CXy7eh0M.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/BvwCr5sS.js","_app/immutable/chunks/D5Mqzety.js","_app/immutable/chunks/Ctf5viQA.js","_app/immutable/chunks/CZx5pxKY.js","_app/immutable/chunks/DLcFoIAq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-DCK7cT-f.js')),
			__memo(() => import('./chunks/1-C3glEb6e.js')),
			__memo(() => import('./chunks/2-BQb0bFAe.js')),
			__memo(() => import('./chunks/3-BbyIdfvC.js')),
			__memo(() => import('./chunks/4-Cf8Y2VWo.js')),
			__memo(() => import('./chunks/5-BBRC9Pd9.js')),
			__memo(() => import('./chunks/6-KoRk7iYf.js')),
			__memo(() => import('./chunks/7-JdIRWsyQ.js')),
			__memo(() => import('./chunks/8-B4koVRw_.js'))
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
				id: "/management/create",
				pattern: /^\/management\/create\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/management/manage",
				pattern: /^\/management\/manage\/?$/,
				params: [],
				page: { layouts: [0,3,], errors: [1,,], leaf: 8 },
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
