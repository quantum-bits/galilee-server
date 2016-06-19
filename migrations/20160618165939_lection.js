'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('lection_type', table => {
            table.increments('id');
            table.string('title').notNullable();
        }),

        knex.schema.createTableIfNotExists('lection', table => {
            table.increments('id');
            table.integer('lection_type_id').references('lection_type.id');
        }),

        knex.schema.createTableIfNotExists('reading_type', table => {
            table.increments('id');
            table.string('title').notNullable();
        }),

        knex.schema.createTableIfNotExists('reading', table => {
            table.increments('id');
            table.integer('seq');
            table.integer('reading_type_id').references('reading_type.id');
            table.integer('lection_id').references('lection.id');
        }),

        knex.schema.createTableIfNotExists('pericope', table => {
            table.increments('id');
            table.integer('reading_id').references('reading.id');
        }),

        knex.schema.createTableIfNotExists('passage', table => {
            table.increments('id');
            table.integer('seq');
            table.string('osis_ref');
            table.boolean('optional');
            table.integer('pericope_id').references('pericope.id');
        })

    ]);
};

exports.down = function (knex, Promise) {

    return Promise.all([
        knex.schema.dropTableIfExists('reading'),
        knex.schema.dropTableIfExists('reading_type'),
        knex.schema.dropTableIfExists('lection'),
        knex.schema.dropTableIfExists('lection_type')
    ])

};
