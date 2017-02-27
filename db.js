"use strict";

const moment = require('moment');
const MasterConfig = require('./master-config');
const pgTypes = require('pg').types;

// Override node-postgres conversion of DATE fields to a timestamp.
const PG_DATE_OID = 1082;
pgTypes.setTypeParser(PG_DATE_OID, function(val) {
    return moment(val).format('YYYY-MM-DD');
});

const knex = exports.knex = require('knex')(MasterConfig.get('db'));

const Model = exports.Model = require('objection').Model;
Model.knex(knex);

