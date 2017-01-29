'use strict';

const db = require('../db');

module.exports = class UserTag extends db.Model {
    static get tableName() {
        return 'user_tag';
    }

    static get relationMappings() {
        return {
            user: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/User',
                join: {
                    from: 'user_tag.user_id',
                    to: 'user.id'
                }
            },
            journal_entries: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/JournalEntry',
                join: {
                    from: 'user_tag.id',
                    through :{
                        from: 'journal_entry_tag.user_tag_id',
                        to:   'journal_entry_tag.journal_entry_id'
                    },
                    to: 'journal_entry.id'
                }
            }
        }
    }
}
