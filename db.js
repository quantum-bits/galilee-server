"use strict";

const moment = require('moment');
const MasterConfig = require('./master-config');
const pgTypes = require('pg').types;

// Override node-postgres conversion of DATE fields to a timestamp.
const PG_DATE_OID = 1082;
const PG_TIMESTAMP_OID = 1114;
const PG_TIMESTAMPTZ_OID = 1184;
pgTypes.setTypeParser(PG_DATE_OID, val => val);

const knex = exports.knex = require('knex')(MasterConfig.get('db'));

const Model = exports.Model = require('objection').Model;
Model.knex(knex);

