'use strict';

const Config = require('../../models/Config');

exports.seed = function (knex, Promise) {
    return knex('config')
        .del()
        .then(() => {
            return Config.query().insertGraph([
                {key: 'upload-root', value: '../resources'},
                {key: 'bg-access-token', value: null},
                {key: 'default-version', value: 'NKJV'}
            ])
        })
        .catch(err => console.error("Error", err));
};
