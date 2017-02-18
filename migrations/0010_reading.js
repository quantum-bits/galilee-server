'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('readingDay', table => {
            table.increments('id');
            table.date('date').notNullable().unique();
            table.string('name').nullable();
        }),

        knex.schema.createTableIfNotExists('reading', table => {
            table.increments('id');
            table.integer('readingDayId').notNullable().references('readingDay.id').onDelete('CASCADE');
            table.integer('seq').notNullable();
            table.string('stdRef').notNullable();
            table.string('osisRef').notNullable();
        }),

        knex.schema.createTableIfNotExists('version', table => {
            table.increments('id');
            table.string('code').notNullable();
            table.string('title').notNullable();
        }),

        knex.schema.createTableIfNotExists('passage', table => {
            table.increments('id');
            table.integer('readingId').notNullable().references('reading.id').onDelete('CASCADE');
            table.integer('versionId').notNullable().references('version.id').onDelete('CASCADE');
            table.text('content').notNullable();
        }),

        knex.schema.createTableIfNotExists('question', table => {
            table.increments('id');
            table.integer('readingDayId').notNullable().references('readingDay.id').onDelete('CASCADE');
            table.integer('seq').notNullable();
            table.string('text').notNullable();
        })

    ]);
};

exports.down = function (knex, Promise) {

    return Promise.all([
        knex.schema.dropTableIfExists('reading'),
        knex.schema.dropTableIfExists('day'),
    ])

};
