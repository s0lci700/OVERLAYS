/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3298390430")

  // Remove file field
  collection.fields.removeById("file347571224")

  // Add text field for photo URL
  collection.fields.addAt(17, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text347571224",
    "max": 0,
    "min": 0,
    "name": "photo",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3298390430")

  collection.fields.removeById("text347571224")

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

  return app.save(collection)
})
