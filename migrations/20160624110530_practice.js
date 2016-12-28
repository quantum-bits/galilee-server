exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('practice', table => {
            table.increments('id');
            table.string('title').notNullable();
            table.text('description').notNullable();
        }),

        knex.schema.createTableIfNotExists('reading_practice', table => {
            table.integer('reading_id').references('reading.id');
            table.integer('practice_id').references('practice.id');
            table.text('advice').notNullable();
            table.primary(['reading_id', 'practice_id']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('reading_practice'),
        knex.schema.dropTableIfExists('practice')
    ])
};
