'use strict';

const db = require('../db');

module.exports = class JournalEntryTag extends db.Model {
    static get tableName() {
        return 'journal_entry_tag';
    }

    static get relationMappings() {
        return {
            user_tag: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/UserTag',
                join: {
                    from: 'journal_entry_tag.user_tag_id',
                    to: 'user_tag.id'
                }
            },
            journal_entry: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/JournalEntry',
                join: {
                    from: 'journal_entry_tag.journal_entry_id',
                    to: 'journal.id'
                }
            }
        }
    }
};
