'use strict';

const db = require('../db');

class Reading extends db.Model {
    static get tableName() {
        return 'reading';
    }

    static get relationMappings() {
        return {
            reading_day: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/ReadingDay',
                join: {
                    from: 'reading.for',
                    to: 'reading_day.date'
                }
            },
            collections: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Collection',
                join: {
                    from: 'reading.id',
                    through: {
                        from: 'reading_collection.reading_id',
                        to: 'reading_collection.collection_id',
                        extra: ['advice']
                    },
                    to: 'collection.id'
                }
            },
            practices: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Practice',
                join: {
                    from: 'reading.id',
                    through: {
                        from: 'reading_practice.reading_id',
                        to: 'reading_practice.practice_id',
                        extra: ['advice']
                    },
                    to: 'practice.id'
                }
            }
        }
    }

}

module.exports = Reading;
