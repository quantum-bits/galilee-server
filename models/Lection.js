'use strict';

const db = require('../db');

class Lection extends db.Model {
    static get tableName() {
        return 'lection';
    }

    asJson() {
        return this.readings.map(reading => {
            let pericope = reading.pericopes[0];
            return {
                title: reading.type.title,
                description: pericope.fullReference(),
                text: pericope.fullText(),
                practices: pericope.allPractices(),
                resource_collections: pericope.allCollections(),
            };
        });
    }

    static get relationMappings() {
        return {
            readings: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'lection.id',
                    to: 'reading.lection_id'
                }
            },
            type: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/LectionType',
                join: {
                    from: 'lection.lection_type_id',
                    to: 'lection_type.id'
                }
            }
        }
    }
}

module.exports = Lection;
