/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_722998738")

  // remove field
  collection.fields.removeById("text478209336")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number478209336",
    "max": null,
    "min": null,
    "name": "hp_current",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_722998738")

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text478209336",
    "max": 0,
    "min": 0,
    "name": "hp_current",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("number478209336")

  return app.save(collection)
})
