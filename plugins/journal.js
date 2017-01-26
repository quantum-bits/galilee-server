'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');

exports.register = function (server, options, next) {

    server.route([
        {
            method: 'GET',
            path: '/entries/{id}',
            config: {
                description: 'Return journal entry having ID',
                auth: 'jwt'
            },
            handler: function (request, reply) {
            }
        },

        {
            method: 'GET',
            path: '/users/{id}/entries',
            config: {
                description: 'Return journal entries for user',
                auth: 'jwt',
                pre: ['userMatches']
            },
            handler: function (request, reply) {
                if (request.pre.userMatches) {
                    JournalEntry.query()
                        .select('journal_entry.id', 'timestamp', 'title', 'entry')
                        .innerJoin('user', 'journal_entry.user_id', 'user.id')
                        .where('user.id', request.params.id)
                        .eager('tags')
                        .then(entries => reply(entries))
                        .catch(err => reply(Boom.badImplementation(err)));
                } else {
                    reply(Boom.unauthorized("Entries owned by another user"));
                }
            }
        },

        {
            method: 'GET',
            path: '/users/{id}/tags',
            config: {
                description: 'Return all tags for user',
                auth: 'jwt',
                pre: ['userMatches']
            },
            handler: function(request, reply) {
                if (request.pre.userMatches) {
                    User.query()
                        .where('id', request.params.id)
                        .first()
                        .eager('tags')
                        .then(user => reply(user.tags))
                        .catch(err => reply(Boom.badImplementation(err)));
                } else {
                    reply(Boom.unauthorized("Tags owned by another user"));
                }
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'journal', version: '0.0.1'};
