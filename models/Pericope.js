'use strict';

const db = require('../db');

class Pericope extends db.Model {
    static get tableName() {
        return 'pericope';
    }

    fullReference() {
        return this.passages.map(p => p.reference()).join(' ');
    }

    static get relationMappings() {
        return {
            reading: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'pericope.reading_id',
                    to: 'reading.id'
                }
            },
            passages: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Passage',
                join: {
                    from: 'pericope.id',
                    to: 'passage.pericope_id'
                }
            },
            practices: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Practice',
                join: {
                    from: 'pericope.id',
                    through: {
                        from: 'pericope_practice.pericope_id',
                        to: 'pericope_practice.practice_id',
                        extra: ['advice']
                    },
                    to: 'practice.id'
                }
            },
            collections: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Collection',
                join: {
                    from: 'pericope.id',
                    through: {
                        from: 'pericope_collection.pericope_id',
                        to: 'pericope_collection.collection_id',
                        extra: ['advice']
                    },
                    to: 'collection.id'
                }
            }
        }
    }

}

module.exports = Pericope;
