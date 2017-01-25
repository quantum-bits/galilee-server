'use strict';

const db = require('../db');

module.exports = class UserTag extends db.Model {
    static get tableName() {
        return 'user_tag';
    }

    static get relationMappings() {
        return {
            jounal_entries: {
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
