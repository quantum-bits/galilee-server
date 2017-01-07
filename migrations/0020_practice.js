exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('practice', table => {
            table.increments('id');
            table.string('title').notNullable();
            table.text('summary').notNullable();
            table.text('description').notNullable();
        }),

        knex.schema.createTableIfNotExists('step', table => {
            table.increments('id');
            table.text('description').notNullable();
            table.integer('seq');
            table.integer('reading_id').references('reading.id');
            table.integer('practice_id').references('practice.id');
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('step'),
        knex.schema.dropTableIfExists('practice')
    ])
};
