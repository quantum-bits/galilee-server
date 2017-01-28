'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');

exports.register = function (server, options, next) {

    server.route([
        {
            method: 'GET',
            path: '/entries',
            config: {
                description: 'Get all entries for a user',
                auth: 'jwt'
            },
            handler: function (request, reply) {
                JournalEntry.query()
                    .select('journal_entry.id', 'updated_at', 'title', 'entry')
                    .innerJoin('user', 'journal_entry.user_id', 'user.id')
                    .where('user.id', request.auth.credentials.id)
                    .eager('tags')
                    .then(entries => reply(entries))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'POST',
            path: '/entries',
            config: {
                description: 'Create a new journal entry',
                auth: 'jwt',
                validate: {
                    payload: {
                        title: Joi.string().required(),
                        entry: Joi.string().required()
                    }
                }
            },
            handler: function (request, reply) {
                JournalEntry.query()
                    .insert({
                        user_id: request.auth.credentials.id,
                        title: request.payload.title,
                        entry: request.payload.entry
                    })
                    .then(entry => reply(entry))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'PATCH',
            path: '/entries/{id}',
            config: {
                description: 'Update a journal entry',
                auth: 'jwt',
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required()
                    },
                    payload: {
                        title: Joi.string().required(),
                        entry: Joi.string().required()
                    }
                }
            },
            handler: function (request, reply) {
                JournalEntry.query()
                    .findById(request.params.id)
                    .then(entry => {
                        if (!entry) {
                            reply(Boom.notFound('No such journal entry'));
                        } else if (entry.user_id !== request.auth.credentials.id) {
                            reply(Boom.unauthorized("Can't access this entry"));
                        } else {
                            entry.$query()
                                .patchAndFetch(request.payload)
                                .then(entry => reply(entry));
                        }
                    })
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/tags',
            config: {
                description: 'Return all tags for user',
                auth: 'jwt'
            },
            handler: function (request, reply) {
                User.query()
                    .where('id', request.auth.credentials.id)
                    .eager('tags')
                    .first()
                    .then(user => reply(user.tags))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'journal', version: '0.0.1'};
