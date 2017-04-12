"use strict";

// Dispense with questions

exports.up = function (knex, Promise) {
    return knex.schema.createTableIfNotExists('direction', table => {
        table.increments('id');
        table.integer('seq').notNullable();
        table.integer('practiceId').notNullable().references('practice.id').onDelete('CASCADE');
        table.integer('readingId').references('reading.id').onDelete('CASCADE');
        table.integer('readingDayId').references('readingDay.id').onDelete('CASCADE');
    }).then(() => {
        // New step table that references 'direction' instead of 'application'. Later, we will
        // delete the old 'step' table and rename this one to 'step'
        return knex.schema.createTableIfNotExists('newStep', table => {
            table.increments('id');
            table.integer('seq').notNullable();
            table.text('description').notNullable();
            table.integer('directionId').notNullable().references('direction.id').onDelete('CASCADE');
        })
    }).then(() => {
        // Migrate 'application'
        return knex.select('id', 'seq', 'readingId', 'practiceId').from('application').map(applicationRow => {
            return knex('direction').returning('id').insert({
                // Create new direction for the practice.
                seq: +applicationRow.seq,
                practiceId: +applicationRow.practiceId,
                readingId: +applicationRow.readingId
            }).then(directionId => {
                // For each step of the application
                return knex.select('seq', 'description').from('step').where('applicationId', applicationRow.id).map(stepRow => {
                    // Create a new step.
                    return knex('newStep').insert({
                        seq: stepRow.seq,
                        description: stepRow.description,
                        directionId: +directionId
                    })
                });
            });
        });
    }).then(() => {
        // Migrate 'question'
        return knex('practice').returning('id').insert({
            title: 'Engaging Scripture in Community',
            summary: '',
            description: '',
            infoUrl: 'https://www.biblegateway.com/resources/scripture-engagement/main/small-group-introduction'
        }).then(practiceId => {
            // For each reading day
            return knex.select('id').from('readingDay').map(readingDayRow => {
                // Fetch the questions for the day
                return knex.select('seq', 'text').from('question').where('readingDayId', readingDayRow.id).then(rows => {
                    if (rows.length > 0) {
                        // We have questions; coalesce them into a single HTML block.
                        let content = '<ol><li>'
                            + rows.map(row => row.text).join('</li><li>')
                            + '</li></ol>';
                        // Create new direction for the appropriate practice.
                        return knex('direction').returning('id').insert({
                            seq: 1,
                            practiceId: +practiceId,
                            readingDayId: +readingDayRow.id
                        }).then(directionId => {
                            // Add a new step with the given content.
                            return knex('newStep').insert({
                                seq: 1,
                                description: content,
                                directionId: +directionId
                            })
                        });
                    }
                });
            });
        });
    }).then(() => {
        // Delete references to 'step' and then 'step' itself.
        return knex.schema.table('journalEntry', table => table.dropColumn('stepId'))
            .then(() => knex.schema.dropTable('stepResource'))
            .then(() => knex.schema.dropTable('step'))
            // Rename 'newStep' to take the place of 'step'. Then reconnect the new 'step'.
            .then(() => knex.schema.renameTable('newStep', 'step'))
            .then(() => knex.schema.table('journalEntry', table => {
                table.integer('stepId').references('step.id')
            }))
            .then(() => knex.schema.createTableIfNotExists('stepResource', table => {
                // Recreate the stepResource table.
                table.integer('stepId').references('step.id').onDelete('CASCADE');
                table.uuid('resourceId').references('resource.id');
                table.primary(['stepId', 'resourceId']);
            }))
            // The 'question' and 'application' tables no longer used.
            .then(() => knex.schema.dropTable('question'))
            .then(() => knex.schema.dropTable('application'))
            // Unrelated: we're not using this column.
            .then(() => knex.schema.table('practice', table => table.dropColumn('description')));
    });
};

exports.down = function (knex, Promise) {
};
