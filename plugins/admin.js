'use strict';

const Boom = require('boom');
const Joi = require('Joi');
const _ = require('lodash');

const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');

exports.register = function (server, options, next) {

    server.route([
        {
            method: 'GET',
            path: '/admin/users',
            config: {
                description: 'All users',
                auth: {
                    strategy: 'jwt',
                    access: { scope: 'admin' }
                }
            },
            handler: function (request, reply) {
                User.query()
                    .eager('[permissions, version, groups.organization]')
                    .omit(['password', 'organizationId'])
                    .orderBy('id')
                    .then(users => reply(users))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/admin/entries',
            config: {
                description: 'All entries',
                auth: {
                    strategy: 'jwt',
                    access: { scope: 'admin' }
                }
            },
            handler: function (request, reply) {
                JournalEntry.query()
                    .orderBy('id')
                    .then(entries => reply(entries))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        }

    ]);

    next();
};

exports.register.attributes = {name: 'admin', version: '0.0.1'};
