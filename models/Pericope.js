'use strict';

const db = require('../db');

class Pericope extends db.Model {
    static get tableName() {
        return 'pericope';
    }

    static get relationMappings() {
        return {
            reading: {
                relation: db.Model.HasOneRelation,
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
            }
        }
    }

}

module.exports = Pericope;
