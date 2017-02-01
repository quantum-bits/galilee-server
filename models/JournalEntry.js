'use strict';

const db = require('../db');
const StampedModel = require('./StampedModel');

module.exports = class JournalEntry extends StampedModel {
    static get tableName() {
        return 'journalEntry';
    }

    static get relationMappings() {
        return {
            user: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/User',
                join: {
                    from: 'journalEntry.userId',
                    to: 'user.id'
                }
            },
            tags: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/UserTag',
                join: {
                    from: 'journalEntry.id',
                    through: {
                        from: 'journalEntryTag.journalEntryId',
                        to:   'journalEntryTag.userTagId'
                    },
                    to: 'userTag.id'
                }
            }
        }
    }
}
