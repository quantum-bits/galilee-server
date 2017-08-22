"use strict";

exports.up = function (knex, Promise) {
    return knex.schema
        .dropTable('stepResource')
        .then(() => knex.schema.dropTable('resourceTag'))
        .then(() => knex.schema.dropTable('resource'))
        .then(() => knex.schema.dropTable('resourceType'))
        .then(() => knex.schema.createTable('license', table => {
            table.increments('id');
            table.string('name').notNullable().comment('Name of license');
            table.string('description').notNullable().comment('Longer description of license');
            table.string('url').comment('URL where more information can be found');
        }))
        .then(() => knex.schema.createTable('mediaType', table => {
            table.comment('Information about media source (e.g., file upload vs. URL)');
            table.increments('id');
            table.string('description').notNullable().comment('Description of type')
        }))
        .then(() => knex.schema.createTable('mimeType', table => {
            table.increments('id');
            table.string('type').notNullable().comment('MIME type (e.g., image/png)');
            table.string('description').notNullable().comment('Human-readable description');
        }))
        .then(() => knex.schema.createTable('resource', table => {
            table.comment('Media Resources');
            table.increments('id');
            table.uuid('fileId').notNullable().comment('Unique ID for file storage');
            table.string('title').notNullable().comment('Title for display to user');
            // TODO: userId should be notNullable
            table.integer('userId').unsigned().references('user.id').comment('User who created resource');
            table.string('sourceUrl').comment('URL where this resource lives (if any)');
            table.string('source').comment('Where this resource lives (if no URL)');
            table.date('importDate').notNullable().comment('Date this resource was imported into system');
            table.string('creator').notNullable().comment('Who created this resource');
            table.date('creationDate').comment('When this resource was originally created');
            table.date('copyrightDate').comment('Date of copyright');
            table.integer('licenseId').unsigned().notNullable().references('license.id');
            table.integer('mediaTypeId').unsigned().notNullable().references('mediaType.id');
            table.integer('mimeTypeId').unsigned().notNullable().references('mimeType.id');
            table.text('notes').comment('Additional notes on this resource');
            table.integer('height').unsigned().comment('Height (pixels) of image, video');
            table.integer('width').unsigned().comment('Width (pixels) of image, video');
            table.string('duration').comment('Duration (HH:MM:SS) of audio, video');
            table.string('medium').comment('Physical medium');
            table.string('physicalDimensions').comment('Physical dimensions');
            table.string('currentLocation').comment('Physical location');
        }))
        .then(() => knex.schema.createTable('resourceTag', table => {
            table.integer('resourceId').unsigned().references('resource.id');
            table.integer('tagId').unsigned().references('tag.id');
        }))
        .then(() => knex.schema.createTable('stepResource', table => {
            table.integer('resourceId').unsigned().references('resource.id');
            table.integer('stepId').unsigned().references('step.id');
            table.integer('seq').unsigned().notNullable().comment('Sequence number');
            table.text('description').notNullable().comment('Description for display to user');
        }));
};

exports.down = function (knex, Promise) {
};
