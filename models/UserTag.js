'use strict';

const db = require('../db');

class UserTag extends db.Model {
    static get tableName() {
        return 'userTag';
    }

    static get relationMappings() {
        return {
            user: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/User',
                join: {
                    from: 'userTag.userId',
                    to: 'user.id'
                }
            },
            journalEntries: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/JournalEntry',
                join: {
                    from: 'userTag.id',
                    through :{
                        from: 'journalEntryUserTag.userTagId',
                        to:   'journalEntryUserTag.journalEntryId'
                    },
                    to: 'journalEntry.id'
                }
            }
        }
    }
}

module.exports = UserTag;
