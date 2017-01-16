'use strict';

const db = require('../db');

class JournalEntry extends db.Model {
    static get tableName() {
        return 'journal_entry';
    }

    static get relationMappings() {
        return {
            user: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/User',
                join: {
                    from: 'journal_entry.user_id',
                    to: 'user.id'
                }
            }
        }
    }
}

module.exports = JournalEntry;
