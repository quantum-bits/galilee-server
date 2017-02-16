"use strict";

const config = require('./master-config');

const knex = exports.knex = require('knex')(config.get('development:db'));

const Model = exports.Model = require('objection').Model;
Model.knex(knex);
