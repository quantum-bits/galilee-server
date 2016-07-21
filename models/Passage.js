'use strict';

const db = require('../db');

class Passage extends db.Model {
    static get tableName() {
        return 'passage';
    }

    static get relationMappings() {
        return {
            pericope: {
                relation: db.Model.HasOneRelation,
                modelClass: __dirname + '/Pericope',
                join: {
                    from: 'passage.pericope_id',
                    to: 'pericope.id'
                }
            }
        }
    }

}

module.exports = Passage;
