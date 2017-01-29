'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');

exports.register = function (server, options, next) {

    function fetchJournalEntries(user_id, offset = 0, limit = null) {
        let builder = JournalEntry.query()
            .where('user_id', user_id)
            .orderBy('updated_at')
            .offset(offset);

        if (limit) {
            builder = builder.limit(limit);
        }

        return builder;
    }

    server.route([

        {
            method: 'GET',
            path: '/entries',
            config: {
                description: 'Journal entries for user',
                auth: 'jwt',
                validate: {
                    query: {
                        offset: Joi.number().integer().min(0).default(0).description('Offset; default 0'),
                        limit: Joi.number().integer().min(1).description('Limit; no default')
                    }
                }
            },
            handler: function (request, reply) {
                let offset = request.query.offset;
                let limit = request.query.limit;

                fetchJournalEntries(request.auth.credentials.id, offset, limit)
                    .then(entries => reply({
                        startIndex: offset,
                        count: entries.length,
                        journalEntries: entries
                    }))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/entries/meta',
            config: {
                description: 'Journal metadata for user',
                auth: 'jwt'
            },
            handler: function (request, reply) {
                reply({
                    mostUsedTags: ['thoughts', 'reflections', 'prayer'],
                    allUsedTags: ['thoughts', 'reflections', 'prayer', 'friends', 'doctrine', 'predestination'],
                    calendarJournalEntries: [
                        {
                            dateString: "2017-01-13",
                            numberEntries: 2
                        },
                        {
                            dateString: "2017-01-11",
                            numberEntries: 1
                        },
                        {
                            dateString: "2017-01-09",
                            numberEntries: 4
                        },
                        {
                            dateString: "2016-12-24",
                            numberEntries: 4
                        }
                    ],
                });
            }
        },

        {
            method: 'POST',
            path: '/entries',
            config: {
                description: 'New entry for current user',
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
                    .insertAndFetch({
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
                    }
                    ,
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
            }
            ,
            handler: function (request, reply) {
                User.query()
                    .where('id', request.auth.credentials.id)
                    .first()
                    .eager('tags')
                    .then(user => reply(user.tags))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        }
    ]);

    next();
}

exports.register.attributes = {name: 'journal', version: '0.0.1'};
