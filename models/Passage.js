'use strict';

const db = require('../db');

class Passage extends db.Model {
    static get tableName() {
        return 'passage';
    }

    static get relationMappings() {
        return {
            version: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Version',
                join: {
                    from: 'passage.versionId',
                    to: 'version.id'
                }
            },
            reading: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'passage.readingId',
                    to: 'reading.id'
                }
            }
        }
    }
}

module.exports = Passage;