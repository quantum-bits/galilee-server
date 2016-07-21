'use strict';

const db = require('../db');

class Passage extends db.Model {
    static get tableName() {
        return 'passage';
    }

    reference() {
        if (this.optional) {
            return `[${this.osis_ref}]`;
        } else {
            return this.osis_ref;
        }
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
