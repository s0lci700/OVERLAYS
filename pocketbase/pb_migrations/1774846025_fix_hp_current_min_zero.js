/// <reference path="../pb_data/types.d.ts" />
// Fix: hp_current was set to "nonzero" in PocketBase admin UI, which blocked
// saving 0 HP values. Setting min: 0 explicitly allows 0 while keeping the
// field non-required.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3298390430")

  // update field
  collection.fields.getById("number478209336").min = 0;

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3298390430")

  // revert: restore null minimum (no constraint)
  collection.fields.getById("number478209336").min = null;

  return app.save(collection)
})
