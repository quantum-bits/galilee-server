'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('resource_type', table => {
            table.increments('id');
            table.string('title').notNullable();
        }),

        knex.schema.createTableIfNotExists('resource', table => {
            table.increments('id');
            table.string('title').notNullable();
            table.string('description').notNullable();
            table.string('rights');
            table.jsonb('details').notNullable();
            table.integer('resource_type_id').references('resource_type.id');
        }),

        knex.schema.createTableIfNotExists('pericope_resource', table => {
            table.integer('pericope_id').references('pericope.id');
            table.integer('resource_id').references('resource.id');
            table.text('advice').notNullable();
            table.primary(['pericope_id', 'resource_id']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('pericope_resource'),
        knex.schema.dropTableIfExists('resource'),
        knex.schema.dropTableIfExists('resource_type')
    ])
};
