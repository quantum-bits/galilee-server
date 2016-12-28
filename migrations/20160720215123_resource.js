'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('collection', table => {
            table.uuid('id').primary();
            table.string('title').notNullable();
            table.text('description');
        }),

        knex.schema.createTableIfNotExists('resource_type', table => {
            table.increments('id');
            table.string('title').notNullable();
            table.string('icon');
        }),

        knex.schema.createTableIfNotExists('resource', table => {
            table.uuid('id').primary();
            table.text('caption').notNullable();
            table.string('copyright_year');
            table.string('copyright_owner');
            table.jsonb('details');
            table.integer('resource_type_id').references('resource_type.id');
        }),

        knex.schema.createTableIfNotExists('collection_resource', table => {
            table.uuid('collection_id').references('collection.id');
            table.uuid('resource_id').references('resource.id');
            table.primary(['collection_id', 'resource_id']);
        }),

        knex.schema.createTableIfNotExists('practice_resource', table => {
            table.integer('practice_id').references('practice.id');
            table.uuid('resource_id').references('resource.id');
            table.primary(['practice_id', 'resource_id']);
        }),

        knex.schema.createTableIfNotExists('tag', table => {
            table.increments('id');
            table.string('title').notNullable();
        }),

        knex.schema.createTableIfNotExists('resource_tag', table => {
            table.uuid('resource_id').references('resource.id');
            table.integer('tag_id').references('tag.id');
            table.primary(['resource_id', 'tag_id']);
        }),

        knex.schema.createTableIfNotExists('reading_collection', table => {
            table.integer('reading_id').references('reading.id');
            table.uuid('collection_id').references('collection.id');
            table.text('advice').notNullable();
            table.primary(['reading_id', 'collection_id']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('reading_collection'),
        knex.schema.dropTableIfExists('collection_resource'),
        knex.schema.dropTableIfExists('practice_resource'),
        knex.schema.dropTableIfExists('collection'),
        knex.schema.dropTableIfExists('resource_tag'),
        knex.schema.dropTableIfExists('tag'),
        knex.schema.dropTableIfExists('resource'),
        knex.schema.dropTableIfExists('resource_type')
    ])
};
