'use strict';

exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTableIfNotExists('post', table => {
            table.increments('id');
            table.string('title').nullable();
            table.text('content').notNullable();
            table.integer('parentPostId').nullable().references('post.id');
            table.integer('userId').notNullable().references('user.id');
            table.integer('groupId').notNullable().references('group.id');
            table.integer('readingId').nullable().references('reading.id');
            table.timestamp('createdAt').defaultTo(knex.fn.now());
            table.timestamp('updatedAt').defaultTo(knex.fn.now());
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('post'),
    ])
};
