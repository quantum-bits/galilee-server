'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('resourceType', table => {
            table.increments('id');
            table.string('title').notNullable();
            table.string('icon');
        }),

        knex.schema.createTableIfNotExists('resource', table => {
            table.uuid('id').primary();
            table.integer('userId').unsigned().references('user.id');
            table.text('caption').notNullable();
            table.string('copyrightYear');
            table.string('copyrightOwner');
            // table.jsonb('details');
            table.integer('resourceTypeId').unsigned().references('resourceType.id');
        }),

        knex.schema.createTableIfNotExists('stepResource', table => {
            table.integer('stepId').unsigned().references('step.id').onDelete('CASCADE');
            table.uuid('resourceId').references('resource.id');
            table.primary(['stepId', 'resourceId']);
        }),

        knex.schema.createTableIfNotExists('resourceTag', table => {
            table.uuid('resourceId').references('resource.id');
            table.integer('tagId').unsigned().references('tag.id');
            table.primary(['resourceId', 'tagId']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('stepResource'),
        knex.schema.dropTableIfExists('resourceTag'),
        knex.schema.dropTableIfExists('resource'),
        knex.schema.dropTableIfExists('resourceType')
    ])
};
