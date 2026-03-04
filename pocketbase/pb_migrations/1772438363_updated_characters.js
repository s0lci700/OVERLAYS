/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3298390430")

  // add field
  collection.fields.addAt(19, new Field({
    "hidden": false,
    "id": "json2769286930",
    "maxSize": 0,
    "name": "species",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(20, new Field({
    "hidden": false,
    "id": "json2698072953",
    "maxSize": 0,
    "name": "languages",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(21, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text751705692",
    "max": 0,
    "min": 0,
    "name": "alignment",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(22, new Field({
    "hidden": false,
    "id": "json327609046",
    "maxSize": 0,
    "name": "proficiencies",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(23, new Field({
    "hidden": false,
    "id": "json3543717251",
    "maxSize": 0,
    "name": "equipment",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3298390430")

  // remove field
  collection.fields.removeById("json2769286930")

  // remove field
  collection.fields.removeById("json2698072953")

  // remove field
  collection.fields.removeById("text751705692")

  // remove field
  collection.fields.removeById("json327609046")

  // remove field
  collection.fields.removeById("json3543717251")

  return app.save(collection)
})
