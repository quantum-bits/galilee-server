'use strict';

const db = require('../db');

class Practice extends db.Model {
    static get tableName() {
        return 'practice';
    }

    static get relationMappings() {
        return {
            steps: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Step',
                join: {
                    from: 'practice.id',
                    to: 'step.id'
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
