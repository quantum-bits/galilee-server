'use strict';

const db = require('../db');

class Tag extends db.Model {
    static get tableName() {
        return 'tag';
    }

    static get relationMappings() {
        return {
            user: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/User',
                join: {
                    from: 'tag.userId',
                    to: 'user.id'
                }
            },
            journalEntries: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/JournalEntry',
                join: {
                    from: 'tag.id',
                    through :{
                        from: 'journalEntryTag.tagId',
                        to:   'journalEntryTag.journalEntryId'
                    },
                    to: 'journalEntry.id'
                }
            }
        }
    }
}

module.exports = Tag;
