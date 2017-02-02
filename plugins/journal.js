'use strict';

const Boom = require('boom');
const Joi = require('Joi');
const _ = require('lodash');
const moment = require('moment');

const User = require('../models/User');
const UserTag = require('../models/UserTag');
const JournalEntry = require('../models/JournalEntry');
const JournalEntryTag = require('../models/JournalEntryTag');

exports.register = function (server, options, next) {

    // Get all the user's tags.
    server.method('getTags', function (userId, next) {
        JournalEntryTag.query()
            .select('userTag.id as userTagId', 'userTag.label')
            .count('userTag.id as uses')
            .join('userTag', 'userTagId', 'userTag.id')
            .where('userTag.userId', userId)
            .groupBy('userTag.id')
            .orderBy('uses', 'desc')
            .then(tags => {
                // In PostgreSQL, count returns bigint, which knex render as a string.
                tags.forEach(tag => {
                    tag.uses = +tag.uses
                });
                return next(null, tags);
            }).catch(err => next(err, null));
    });

    // Get statistics on all the user's journal entries.
    server.method('getJournalStats', function (userId, next) {
        JournalEntry.query()
            .select('updatedAt')
            .where('userId', userId)
            .map(entry => moment(entry.updatedAt).format('YYYY-MM-DD'))
            .then(entries => next(null, _.countBy(entries)))
            .catch(err => next(err, null));
    });

    // Count the number of journal entries for a user.
    server.method('countJournalEntries', function (userId, next) {
        JournalEntry.query()
            .where('userId', userId)
            .count('*')
            .first()
            .then(count => next(null, count.count))
            .catch(err => next(err, null));
    })

    server.method('fetchJournalEntry', function (id, next) {
        console.log("FETCH", id);
        JournalEntry.query()
            .findById(id)
            .eager('tags')
            .omit(UserTag, ['userId'])
            .then(result => next(null, result))
            .catch(err => next(err, null));
    });

    // Return journal entries for a user. Offset defaults to the first entry.
    // Limit defaults to unlimited.
    server.method('fetchJournalEntries', function (userId, offset = 0, limit = null, next) {
        // Comment query elements.
        let queryBuilder = JournalEntry.query()
            .where('userId', userId)
            .eager('tags')
            .omit(UserTag, ['userId'])
            .orderBy('updatedAt', 'desc')
            .offset(offset);

        // Maybe add limit clause.
        if (limit) {
            queryBuilder = queryBuilder.limit(limit);
        }

        // Run the query and postprocess the results.
        queryBuilder
            .then(entries => next(null, entries))
            .catch(err => next(err, null));
    });

    server.route([

        {
            method: 'GET',
            path: '/entries',
            config: {
                description: 'Journal entries for user',
                auth: 'jwt',
                pre: [
                    {
                        assign: 'entries',
                        method: 'fetchJournalEntries(auth.credentials.id,query.offset,query.limit)'
                    }
                ],
                validate: {
                    query: {
                        offset: Joi.number().integer().min(0).default(0).description('Offset; default 0'),
                        limit: Joi.number().integer().min(1).description('Limit; no default')
                    }
                }
            },
            handler: function (request, reply) {
                reply({
                    offset: request.query.offset,
                    count: request.pre.entries.length,
                    entries: request.pre.entries
                });
            }
        },

        {
            method: 'GET',
            path: '/entries/{id}',
            config: {
                description: 'Specific journal entry',
                auth: 'jwt',
                pre: [
                    {assign: 'entry', method: 'fetchJournalEntry(params.id)'}
                ],
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Entry ID')
                    }
                }
            },
            handler: function (request, reply) {
                if (request.pre.entry.userId !== request.auth.credentials.id) {
                    reply(Boom.unauthorized("You don't own this entry"));
                } else {
                    reply(request.pre.entry);
                }
            }
        },

        {
            method: 'GET',
            path: '/entries/meta',
            config: {
                description: 'Journal metadata for user',
                auth: 'jwt',
                pre: [
                    {assign: 'totalEntries', method: 'countJournalEntries(auth.credentials.id)'},
                    {assign: 'tagStats', method: 'getTags(auth.credentials.id)'},
                    {assign: 'journalStats', method: 'getJournalStats(auth.credentials.id)'}
                ]
            },
            handler: function (request, reply) {
                let allTags = request.pre.tagStats;
                let frequentTags = _.take(allTags, 3);
                reply({
                    totalEntries: request.pre.totalEntries,
                    mostUsedTags: frequentTags,
                    allUsedTags: allTags,
                    calendarJournalEntries: request.pre.journalStats
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
                        userId: request.auth.credentials.id,
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
                        } else if (entry.userId !== request.auth.credentials.id) {
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
                auth: 'jwt',
                pre: [
                    {assign: 'tags', method: 'getTags(auth.credentials.id)'},
                ]
            },
            handler: function (request, reply) {
                reply(request.pre.tags);
            }
        }
    ]);

    next();
}

exports.register.attributes = {name: 'journal', version: '0.0.1'};
