exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('practice', table => {
            table.increments('id');
            table.string('title').notNullable();
            table.text('summary').notNullable();
            table.text('description').notNullable();
        }),

        knex.schema.createTableIfNotExists('application', table => {
            table.increments('id');
            table.integer('reading_id').references('reading.id');
            table.integer('practice_id').references('practice.id');
        }),

        knex.schema.createTableIfNotExists('step', table => {
            table.increments('id');
            table.integer('seq').notNullable();
            table.text('description').notNullable();
        }),

        knex.schema.createTableIfNotExists('application_step', table => {
            table.integer('application_id').references('application.id');
            table.integer('step_id').references('step.id');
            table.primary(['step_id', 'application_id']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('step'),
        knex.schema.dropTableIfExists('practice')
    ])
};
