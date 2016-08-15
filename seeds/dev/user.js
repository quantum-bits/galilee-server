'use strict';

exports.seed = function (knex, Promise) {
    return knex.schema.dropTableIfExists('version')

        .then(Promise.all([
            knex.schema.dropTableIfExists('user_permission'),
            knex.schema.dropTableIfExists('permission'),
            knex.schema.dropTableIfExists('user')
        ]))

        .then(() => {

        })

        .catch(err => console.log('There was a problem', err));
};
