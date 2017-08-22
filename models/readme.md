# Vocabulary for the relation descriptions

From https://vincit.github.io/objection.js/#relations

- _source model_: The model for which you are writing the `relationMapping`
- _related model_: The model at the other end of the relation.

Relationships

- `BelongsToOneRelation`: Source model has the foreign key
- `HasManyRelation`: Related model has the foreign key
- `HasOneRelation`: Like `HasManyRelation` but for one related row
- `ManyToManyRelation`: Model related to _list_ of other models through join table
- `HasOneThroughRelation`: Model related to _single_ model through join table


Tom's old ideas

* `BelongsToOneRelation` - _many_ side of one-to-many 
   or _one_ side of one-to-one.
* `HasOneRelation` - _other_ side one-to-one
* `HasManyRelation` - _one_ side of one-to-many
* `ManyToManyRelation` - _both_ sides of many-to-many

