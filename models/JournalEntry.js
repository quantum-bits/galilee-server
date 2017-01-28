'use strict';

const db = require('../db');
const StampedModel = require('./StampedModel');

module.exports = class JournalEntry extends StampedModel {
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
            },
            tags: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/UserTag',
                join: {
                    from: 'journal_entry.id',
                    through: {
                        from: 'journal_entry_tag.journal_entry_id',
                        to:   'journal_entry_tag.user_tag_id'
                    },
                    to: 'user_tag.id'
                }
            }
        }
    }
}