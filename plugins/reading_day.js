'use strict';

const Boom = require('boom');
const Joi = require('joi');

const debug = require('debug')('readingday');

const Config = require('../models/Config');
const Passage = require('../models/Passage');
const Question = require('../models/Question');
const Reading = require('../models/Reading');
const ReadingDay = require('../models/ReadingDay');
const Version = require('../models/Version');

exports.register = function (server, options, next) {

    const bibleService = options.bibleService;

    server.method('getReadingDayById', function (readingDayId, next) {
        ReadingDay.query()
            .findById(readingDayId)
            .then(readingDay => next(null, readingDay))
            .catch(err => next(err, null));
    });

    server.method('getReadingDayByDate', function (readingDayDate, next) {
        ReadingDay.query()
            .where('date', readingDayDate)
            .first()
            .then(readingDay => next(null, readingDay))
            .catch(err => next(err, null));
    });

    // Resolve a reading's passage from the given version. If the passage is already in the database,
    // use it directly. Otherwise, fetch it from BG and store it in the database. In either case,
    // the reading will be updated with the passage content and version.
    function resolvePassage(reading, version) {
        debug(`Resolve ${reading.osisRef} from ${version.code}`);
        return Passage.query()
            .where('readingId', reading.id)
            .andWhere('versionId', version.id)
            .first()
            .then(result => {
                if (result) {
                    debug("Already in DB");
                    return result.content;
                } else {
                    debug("Fetch from BG");
                    return bibleService.getPassage(version.code, reading.osisRef).then(response => {
                        const content = response.passages[0].content;
                        return Passage.query().insert({
                            readingId: reading.id,
                            versionId: version.id,
                            content: content
                        }).then(() => content);
                    });
                }
            }).then(content => {
                reading.text = content;
                reading.version = version;
                return reading;
            });
    }

    server.route([
        {
            method: 'GET',
            path: '/daily/{date}/{versionCode?}',
            config: {
                description: "Get readings for given date (or 'today')",
                auth: {
                    strategy: 'jwt',
                    mode: 'optional'    // If credentials present, must be valid.
                },
                // TODO: Add validators
                pre: [
                    {assign: 'date', method: 'normalizeDate(params.date)'}
                ]
            },
            handler: function (request, reply) {
                debug("Credentials %O", request.auth.credentials);

                // TODO: Make this come from the user object
                const version = bibleService.resolveVersion(request.params.versionCode);

                ReadingDay.query()
                    .where('date', request.pre.date)
                    .first()
                    .eager('[readings(bySeq).[applications(bySeq).[practice,steps(bySeq)]],questions(bySeq)]', {
                        bySeq: qBuilder => qBuilder.orderBy('seq')
                    })
                    .omit(['readingDayId', 'readingId', 'practiceId'])
                    .then(readingDay => {
                        if (!readingDay) {
                            reply(Boom.notFound(`No reading data for '${request.pre.date}'`));
                        } else {
                            // Resolve the passage for each reading.
                            return Promise.all(readingDay.readings
                                .map(reading => resolvePassage(reading, version)))
                                .then(readings => reply(readingDay));
                        }
                    })
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'POST',
            path: '/readingdays',
            config: {
                description: 'Create reading day',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                validate: {
                    payload: {
                        date: Joi.date().required().description('Date of reading day'),
                        name: Joi.string().description('Optional day name (e.g., Easter)')
                    }
                },
                pre: [
                    {assign: 'readingDay', method: 'getReadingDayByDate(payload.date)'}
                ]
            },
            handler: function (request, reply) {
                if (request.pre.readingDay) {
                    reply(Boom.conflict(`Already a reading day for ${request.payload.date}`));
                } else {
                    ReadingDay.query()
                        .insert({
                            date: request.payload.date,
                            name: request.payload.name || ''
                        })
                        .returning('*')
                        .then(readingDay => reply(readingDay))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        },

        {
            method: 'GET',
            path: '/readingdays',
            config: {
                description: 'Get all reading days',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
            },
            handler: function (request, reply) {
                ReadingDay.query()
                    .then(readingDays => reply(readingDays))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/readingdays/{id}',
            config: {
                description: 'Get a reading day',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading day ID')
                    }
                },
                pre: [
                    {assign: 'readingDay', method: 'getReadingDayById(params.id)'}
                ]
            },
            handler: function (request, reply) {
                if (!request.pre.readingDay) {
                    reply(Boom.notFound(`No readingDay with ID ${request.params.id}`));
                } else {
                    reply(request.pre.readingDay);
                }
            }
        },

        {
            method: 'PATCH',
            path: '/readingdays/{id}',
            config: {
                description: 'Update reading day',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading day ID')
                    },
                    payload: {
                        date: Joi.date().description('Date of reading day'),
                        name: Joi.string().description('Optional day name (e.g., Easter)')
                    }
                },
                pre: [
                    {assign: 'readingDay', method: 'getReadingDayById(params.id)'}
                ]
            },
            handler: function (request, reply) {
                if (!request.pre.readingDay) {
                    reply(Boom.notFound(`No reading day with ID ${request.params.id}`));
                } else {
                    request.pre.readingDay.$query()
                        .updateAndFetch(request.payload)
                        .then(readingDay => reply(readingDay))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        },

        {
            method: 'DELETE',
            path: '/readingdays/{id}',
            config: {
                description: 'Delete a reading day',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading day ID')
                    }
                },
                pre: [
                    {assign: 'readingDay', method: 'getReadingDayById(params.id)'}
                ]
            },
            handler: function (request, reply) {
                if (!request.pre.readingDay) {
                    reply(Boom.notFound(`No readingDay with ID ${request.params.id}`));
                } else {
                    ReadingDay.query()
                        .deleteById(request.params.id)
                        .then(result => reply(result))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        }

    ]);

    next();
};

exports.register.attributes = {name: 'readingday', version: '0.0.1'};
