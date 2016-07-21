exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('practice', table => {
            table.increments('id');
            table.string('title').notNullable();
            table.string('description').notNullable();
        }),

        knex.schema.createTableIfNotExists('practice_detail', table => {
            table.increments('id');
            table.string('title').notNullable();
            table.string('description').notNullable();
            table.integer('practice_id').references('practice.id');
        }),

        knex.schema.createTableIfNotExists('pericope_practice', table => {
            table.integer('pericope_id').references('pericope.id');
            table.integer('practice_id').references('practice.id');
            table.text('advice').notNullable();
            table.primary(['pericope_id', 'practice_id']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('pericope_practice'),
        knex.schema.dropTableIfExists('practice_detail'),
        knex.schema.dropTableIfExists('practice')
    ])
};
