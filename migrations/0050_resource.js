'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('resource_type', table => {
            table.increments('id');
            table.string('title').notNullable();
            table.string('icon');
        }),

        knex.schema.createTableIfNotExists('resource', table => {
            table.uuid('id').primary();
            table.integer('user_id').references('user.id');
            table.text('caption').notNullable();
            table.string('copyright_year');
            table.string('copyright_owner');
            table.jsonb('details');
            table.integer('resource_type_id').references('resource_type.id');
        }),

        knex.schema.createTableIfNotExists('step_resource', table => {
            table.integer('step_id').references('step.id');
            table.uuid('resource_id').references('resource.id');
            table.primary(['step_id', 'resource_id']);
        }),

        knex.schema.createTableIfNotExists('tag', table => {
            table.increments('id');
            table.string('title').notNullable();
        }),

        knex.schema.createTableIfNotExists('resource_tag', table => {
            table.uuid('resource_id').references('resource.id');
            table.integer('tag_id').references('tag.id');
            table.primary(['resource_id', 'tag_id']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('reading_collection'),
        knex.schema.dropTableIfExists('step_resource'),
        knex.schema.dropTableIfExists('resource_tag'),
        knex.schema.dropTableIfExists('tag'),
        knex.schema.dropTableIfExists('resource'),
        knex.schema.dropTableIfExists('resource_type')
    ])
};
