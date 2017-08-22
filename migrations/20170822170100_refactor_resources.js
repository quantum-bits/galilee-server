"use strict";

exports.up = function (knex, Promise) {
    return knex.schema.createTable('resourceFile', table => {
        table.increments('id');
        table.integer('userId').unsigned().notNullable().references('user.id').comment('User who created/uploaded file');
        table.uuid('fileId').notNullable().comment('Unique ID for file storage');
        table.integer('mimeTypeId').unsigned().notNullable().references('mimeType.id');
        table.string('origin').notNullable().comment('Where did this file come from?');
        table.date('importDate').notNullable().comment('Date this resource was imported into system');
        table.integer('height').unsigned().comment('Height (pixels) of image, video');
        table.integer('width').unsigned().comment('Width (pixels) of image, video');
        table.string('duration').comment('Duration (HH:MM:SS) of audio, video');
    }).then(() => knex.schema.table('resource', table => {
        table.dropColumn('fileId');
        table.dropColumn('mimeTypeId');
        table.dropColumn('importDate');
        table.dropColumn('height');
        table.dropColumn('width');
        table.dropColumn('duration');
        table.integer('resourceFileId').unsigned().notNullable().references('resourceFile.id');
    }));
};

exports.down = function (knex, Promise) {
};
