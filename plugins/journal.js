'use strict';

const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
const Promise = require('bluebird');
const moment = require('moment');
const debug = require('debug')('journal');

const User = require('../models/User');
const Tag = require('../models/Tag');
const JournalEntry = require('../models/JournalEntry');
const JournalEntryTag = require('../models/JournalEntryTag');

exports.register = function (server, options, next) {

    // Get usage statistics for the user's tags.
    server.method('getTagStats', function (userId, next) {
        JournalEntryTag.query()
            .select('tag.id', 'tag.label')
            .count('tag.id as uses')
            .join('tag', 'tagId', 'tag.id')
            .where('tag.userId', userId)
            .groupBy('tag.id')
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
            .orderBy('updatedAt')
            .map(entry => moment(entry.updatedAt).format('YYYY-MM-DD'))
            .then(entries => next(null, _.countBy(entries)))
            .catch(err => next(err, null));
    });

    // Get a list of the user's tags.
    server.method('getTags', function (userId, next) {
        Tag.query()
            .where('userId', userId)
            .omit(['userId'])
            .then(tags => next(null, tags))
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
        JournalEntry.query()
            .findById(id)
            .eager('tags')
            .omit(Tag, ['userId'])
            .then(result => next(null, result))
            .catch(err => next(err, null));
    });

    // Return journal entries for a user. Offset defaults to the first entry.
    // Limit defaults to unlimited.
    server.method('fetchJournalEntries', function (userId, queryParams, next) {
        let queryBuilder = JournalEntry.query()
            .select('journalEntry.id', 'journalEntry.title', 'journalEntry.entry',
                'journalEntry.createdAt', 'journalEntry.updatedAt')
            .where('journalEntry.userId', userId)
            .eager('tags')
            .orderBy('journalEntry.updatedAt', 'desc')
            .offset(queryParams.offset || 0);

        if (queryParams.limit) {
            queryBuilder.limit(queryParams.limit);
        }

        if (queryParams.date) {
            const fromDate = moment(queryParams.date).format('YYYY-MM-DD');
            const toDate = moment(fromDate).add(1, 'day').format('YYYY-MM-DD');;
            queryBuilder
                .where('updatedAt', '>=', fromDate)
                .where('updatedAt', '<',  toDate);
        }

        if (queryParams.tag) {
            queryBuilder
                .join('journalEntryTag', 'journalEntry.id', 'journalEntryTag.journalEntryId')
                .join('tag', 'journalEntryTag.tagId', 'tag.id')
                .where('tag.id', queryParams.tag);
        }

        // Run the query
        queryBuilder
            .map(entry => {
                // Before: "2017-02-17T13:38:14.266Z"   (UTC)
                // After:  "2017-02-17T08:38:14-05:00"  (Local)
                entry.updatedAt = moment(entry.updatedAt).format();
                entry.createdAt = moment(entry.createdAt).format();
                return entry;
            })
            .then(entries => next(null, entries))
            .catch(err => next(err, null));
    });

    // Map over a list of tags and store newly created ones (from the UI)
    // in the database. Return the entire list of tags, ready to be
    // connected to a journal entry.
    server.method('resolveTagList', function (userId, tags, next) {
        Promise.all(tags.map(tag => {
            if (tag.id < 0) {
                return Tag.query()
                    .insertAndFetch({
                        label: tag.label,
                        userId: userId
                    });
            } else {
                return tag;
            }
        })).then(tags => next(null, tags)).catch(err => next(err, null));
    });

    server.route([

        {
            method: 'GET',
            path: '/entries',
            config: {
                description: 'Journal entries for user',
                auth: 'jwt',
                pre: [
                    {assign: 'entries', method: 'fetchJournalEntries(auth.credentials.id, query)'}
                ],
                validate: {
                    query: {
                        offset: Joi.number().integer().min(0).default(0).description('Offset; default 0'),
                        limit: Joi.number().integer().min(1).description('Limit; no default'),
                        date: Joi.string().isoDate().description('Entries for a given date'),
                        tag: Joi.number().integer().min(1).description('Entries with a given tag ID')
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
                if (!request.pre.entry) {
                    reply(Boom.notFound("No such entry"))
                } else if (request.pre.entry.userId !== request.auth.credentials.id) {
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
                    {assign: 'tagStats', method: 'getTagStats(auth.credentials.id)'},
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
                pre: [
                    {assign: 'allTags', method: 'resolveTagList(auth.credentials.id, payload.tags)'}
                ],
                validate: {
                    payload: {
                        title: Joi.string().required(),
                        entry: Joi.string().required(),
                        tags: Joi.array().required()
                    }
                }
            },
            handler: function (request, reply) {
                // TODO: This is unlikely to be the best way to pass along the new entry,
                // but the .relate query below doesn't return the entry, just the IDs
                // of the newly inserted relationship.
                let new_entry = null;
                
                JournalEntry.query().insert({
                    userId: request.auth.credentials.id,
                    title: request.payload.title,
                    entry: request.payload.entry
                }).then(entry => {
                    new_entry = entry;
                    return entry.$relatedQuery('tags')
                        .relate(request.pre.allTags.map(tag => tag.id));
                }).then(() =>
                    JournalEntry.query()
                        .findById(new_entry.id)
                        .eager('tags')
                ).then(entry => reply(entry))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'DELETE',
            path: '/entries/{id}',
            config: {
                description: 'Delete a journal entry',
                auth: 'jwt',
                pre: [
                    {assign: 'entry', method: 'fetchJournalEntry(params.id)'}
                ],
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required()
                    }
                }
            },
            handler: function (request, reply) {
                if (request.pre.entry.userId !== request.auth.credentials.id) {
                    return reply(Boom.unauthorized("Can't access this entry"));
                }

                request.pre.entry.$relatedQuery('tags').unrelate().then(() => {
                    JournalEntry.query()
                        .deleteById(request.params.id)
                        .then(rowsDeleted => reply(rowsDeleted));
                }).catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'PATCH',
            path: '/entries/{id}',
            config: {
                description: 'Update a journal entry',
                auth: 'jwt',
                pre: [
                    {assign: 'allTags', method: 'resolveTagList(auth.credentials.id, payload.tags)'},
                    {assign: 'existingEntry', method: 'fetchJournalEntry(params.id)'}
                ],
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required()
                    },
                    payload: {
                        title: Joi.string().required(),
                        entry: Joi.string().required(),
                        tags: Joi.array().required()
                    }
                }
            },
            handler: function (request, reply) {
                let entry = request.pre.existingEntry;

                // Ensure the user owns this entry.
                if (entry.userId !== request.auth.credentials.id) {
                    return reply(Boom.unauthorized("Can't access this entry"));
                }

                // Update fields from the request.
                entry.$query().patchAndFetch({
                    title: request.payload.title,
                    entry: request.payload.entry
                }).then(() => {
                    // Toss existing tags; simpler than figuring out
                    // which should stay and which should go.
                    return entry.$relatedQuery('tags').unrelate();
                }).then(() => {
                    // Add back all the requested tags. New ones
                    // have already been resolve by resolveTagList
                    return entry.$relatedQuery('tags')
                        .relate(request.pre.allTags.map(tag => tag.id));
                }).then(() => {
                    // Fetch the complete entry as response.
                    server.methods.fetchJournalEntry(entry.id, (err, result) => {
                        if (err) {
                            reply(Boom.badImplementation(err));
                        } else {
                            reply(result);
                        }
                    })
                }).catch(err => reply(Boom.badImplementation(err)));
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
            }
            ,
            handler: function (request, reply) {
                reply(request.pre.tags);
            }
        }
    ]);

    next();
}

exports.register.attributes = {name: 'journal', version: '0.0.1'};
