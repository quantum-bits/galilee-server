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
            table.integer('readingId').notNullable().references('reading.id');
            table.integer('practiceId').notNullable().references('practice.id');
        }),

        knex.schema.createTableIfNotExists('step', table => {
            table.increments('id');
            table.integer('seq').notNullable();
            table.text('description').notNullable();
        }),

        knex.schema.createTableIfNotExists('applicationStep', table => {
            table.integer('applicationId').notNullable().references('application.id');
            table.integer('stepId').notNullable().references('step.id');
            table.primary(['stepId', 'applicationId']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('practice'),
        knex.schema.dropTableIfExists('application'),
        knex.schema.dropTableIfExists('step'),
        knex.schema.dropTableIfExists('applicationStep')
    ])
};
