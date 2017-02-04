'use strict';

const db = require('../db');

module.exports = class JournalEntryTag extends db.Model {
    static get tableName() {
        return 'journalEntryTag';
    }

    static get relationMappings() {
        return {
            tag: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Tag',
                join: {
                    from: 'journalEntryTag.tagId',
                    to: 'tag.id'
                }
            },
            journalEntry: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/JournalEntry',
                join: {
                    from: 'journalEntryTag.journalEntryId',
                    to: 'journal.id'
                }
            }
        }
    }
};
