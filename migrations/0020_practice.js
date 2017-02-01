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
            table.integer('readingId').references('reading.id');
            table.integer('practiceId').references('practice.id');
        }),

        knex.schema.createTableIfNotExists('step', table => {
            table.increments('id');
            table.integer('seq').notNullable();
            table.text('description').notNullable();
        }),

        knex.schema.createTableIfNotExists('applicationStep', table => {
            table.integer('applicationId').references('application.id');
            table.integer('stepId').references('step.id');
            table.primary(['stepId', 'applicationId']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('step'),
        knex.schema.dropTableIfExists('practice')
    ])
};
