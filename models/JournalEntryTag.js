'use strict';

const db = require('../db');

module.exports = class JournalEntryTag extends db.Model {
    static get tableName() {
        return 'journalEntryTag';
    }

    static get relationMappings() {
        return {
            userTag: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/UserTag',
                join: {
                    from: 'journalEntryTag.userTagId',
                    to: 'userTag.id'
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
