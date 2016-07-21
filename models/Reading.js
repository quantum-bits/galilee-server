'use strict';

const db = require('../db');

class Reading extends db.Model {
    static get tableName() {
        return 'reading';
    }

    static get relationMappings() {
        return {
            lection: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Lection',
                join: {
                    from: 'reading.lection_id',
                    to: 'lection.id'
                }
            },
            type: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/ReadingType',
                join: {
                    from: 'reading.reading_type_id',
                    to: 'reading_type.id'
                }
            },
            pericopes: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Pericope',
                join: {
                    from: 'reading.id',
                    to: 'pericope.reading_id'
                }
            }
        }
    }

}

module.exports = Reading;
