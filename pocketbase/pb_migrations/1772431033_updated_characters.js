/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3298390430")

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "json3526397306",
    "maxSize": 0,
    "name": "class_primary",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "json4100327849",
    "maxSize": 0,
    "name": "conditions",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "json4016499630",
    "maxSize": 0,
    "name": "resources",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "file347571224",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "photo",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "hidden": false,
    "id": "json3160978512",
    "maxSize": 0,
    "name": "background",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3298390430")

  // remove field
  collection.fields.removeById("json3526397306")

  // remove field
  collection.fields.removeById("json4100327849")

  // remove field
  collection.fields.removeById("json4016499630")

  // remove field
  collection.fields.removeById("file347571224")

  // remove field
  collection.fields.removeById("json3160978512")

  return app.save(collection)
})
