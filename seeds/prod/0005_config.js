'use strict';

const debug = require('debug')('seed');

const Config = require('../../models/Config');

exports.seed = function (knex, Promise) {
    debug("RUNNING CONFIG");
    return Config.query().insertGraph([
        {key: 'upload-root', value: '../resources'},
        {key: 'default-version', value: 'MSG'}
    ]).catch(err => console.error("Error", err));
};
