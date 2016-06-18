"use strict";

const data_sources = require('./knexfile');

const knex = exports.knex = require('knex')(data_sources.development);

const Model = exports.Model = require('objection').Model;
Model.knex(knex);
