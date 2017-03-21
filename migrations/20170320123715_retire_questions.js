"use strict";

// Dispense with questions

exports.up = function (knex, Promise) {
    return knex.schema.createTableIfNotExists('guidance', table => {
        table.increments('id');
        table.integer('practiceId').notNullable().references('practice.id').onDelete('CASCADE');
    }).then(() => Promise.all([
        // Relate a 'reading' to a 'practice' via 'guidance'.
        knex.schema.createTableIfNotExists('readingGuidance', table => {
            table.increments('id');
            table.integer('seq').notNullable();
            table.integer('readingId').notNullable().references('reading.id').onDelete('CASCADE');
            table.integer('guidanceId').notNullable().references('guidance.id');
        }),
        // Relate a 'readingDay' to a 'practice' via 'guidance'.
        knex.schema.createTableIfNotExists('readingDayGuidance', table => {
            table.increments('id');
            table.integer('seq').notNullable();
            table.integer('readingDayId').notNullable().references('readingDay.id').onDelete('CASCADE');
            table.integer('guidanceId').notNullable().references('guidance.id');
        }),
        // New step table that references 'guidance' instead of 'application'. Later, we will
        // delete the old 'step' table and rename this one to 'step'
        knex.schema.createTableIfNotExists('newStep', table => {
            table.increments('id');
            table.integer('seq').notNullable();
            table.text('description').notNullable();
            table.integer('guidanceId').notNullable().references('guidance.id').onDelete('CASCADE');
        })
    ])).then(() => {
        // Migrate applications to guidance/readingGuidance
        return knex.select('id', 'seq', 'readingId', 'practiceId').from('application').map(applicationRow => {
            return knex('guidance').returning('id').insert({
                // Create new guidance for the practice.
                practiceId: applicationRow.practiceId
            }).then(guidanceId => {
                // For each step of the application
                return knex.select('seq', 'description').from('step').where('applicationId', applicationRow.id).map(stepRow => {
                    return Promise.all([
                        // Create a new readingGuidance associated with the new guidance
                        knex('readingGuidance').insert({
                            seq: +applicationRow.seq,
                            readingId: +applicationRow.readingId,
                            guidanceId: +guidanceId
                        }),
                        // Create a new step.
                        knex('newStep').insert({
                            seq: stepRow.seq,
                            description: stepRow.description,
                            guidanceId: +guidanceId
                        })
                    ]);
                });
            });
        });
    }).then(() => {
        // Migrate questions to guidance/readingDayGuidance
        return knex('practice').returning('id').insert({
            title: 'Engaging Scripture in Community',
            summary: '',
            description: ''
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
                        // Create new guidance for the appropriate practice.
                        return knex('guidance').returning('id').insert({
                            practiceId: +practiceId
                        }).then(guidanceId => {
                            return Promise.all([
                                // Add a readingDayGuidance for the newly added guidance.
                                knex('readingDayGuidance').insert({
                                    seq: 1,
                                    readingDayId: +readingDayRow.id,
                                    guidanceId: +guidanceId
                                }),
                                // Add a new step with the given content.
                                knex('newStep').insert({
                                    seq: 1,
                                    description: content,
                                    guidanceId: +guidanceId
                                })
                            ]);
                        });
                    }
                });
            });
        });
    }).then(() => {
        return;
        // Delete references to 'step' and then 'step' itself.
        return knex.schema.table('journalEntry', table => table.dropColumn('stepId'))
            .then(() => knex.schema.dropTable('stepResource'))
            .then(() => knex.schema.dropTable('step'))
            // Rename 'newStep' to take the place of 'step'. Then reconnect the new 'step'.
            .then(() => knex.schema.renameTable('newStep', 'step'))
            .then(() => knex.schema.table('journalEntry', table => table.integer('stepId').references('step.id')))
            // Questions no longer used.
            .then(() => knex.schema.dropTable('question'))
            // Don't need the 'application' table any longer (replaced by 'guidance' and 'readingXxxPractice'.
            .then(() => knex.schema.dropTable('application'));
    });
}

exports.down = function (knex, Promise) {
};
