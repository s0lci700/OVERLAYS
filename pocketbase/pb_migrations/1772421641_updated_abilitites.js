/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_901897335")

  // update collection data
  unmarshal({
    "name": "abilities"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_901897335")

  // update collection data
  unmarshal({
    "name": "abilitites"
  }, collection)

  return app.save(collection)
})
