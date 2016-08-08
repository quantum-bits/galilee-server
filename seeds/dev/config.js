'use strict';

const Config = require('../../models/Config');

exports.seed = function (knex, Promise) {
    return knex('config').del()

        .then(() => {
            return Config
                .query()
                .insert({
                    key: 'upload-root',
                    value: '../resources'
                });
        })
        .catch(err => console.error("Error", err));
};
