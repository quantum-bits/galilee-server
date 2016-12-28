'use strict';

const db = require('../db');

class Practice extends db.Model {
    static get tableName() {
        return 'practice';
    }

    static get relationMappings() {
        return {
            resources: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'practice.id',
                    through: {
                        from: 'practice_resource.practice_id',
                        to: 'practice_resource.resource_id'
                    },
                    to: 'resource.id'
                }
            },
            readings: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/reading',
                join: {
                    from: 'practice.id',
                    through: {
                        from: 'reading_practice.practice_id',
                        to: 'reading_practice.reading_id',
                        extra: ['advice']
                    },
                    to: 'reading.id'
                }
            }
        }
    }

}

module.exports = Practice;
