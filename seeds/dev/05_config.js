'use strict';

const Config = require('../../models/Config');

exports.seed = function (knex, Promise) {
    return Config.query().insertGraph([
        {key: 'bg-access-token', value: null},
        {key: 'default-version', value: 'MSG'}
    ]).catch(err => console.error("Error", err));
};
