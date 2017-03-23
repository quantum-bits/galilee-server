'use strict';

const Boom = require('boom');
const Joi = require('joi');
const assert = require('assert');

const debug = require('debug')('readingday');

const Config = require('../models/Config');
const Passage = require('../models/Passage');
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

    function resolveVersion(request) {
        // Version from request parameter.
        const paramsVersion = bibleService.findVersionByCode(request.params.versionCode);

        // Preferred version of authenticated user, if any.
        const userVersion = request.auth.isAuthenticated
            ? bibleService.findVersionById(request.auth.credentials.preferredVersionId)
            : null;

        const defaultVersion = bibleService.defaultVersion;

        debug("Params %O\nUser %O\nDefault %O", paramsVersion, userVersion, defaultVersion);
        const rtnVersion = paramsVersion || userVersion || defaultVersion;
        assert(rtnVersion, `Can't resolve version for ${request}`);

        return rtnVersion;
    }

    // Resolve a reading's passage from the given version. If the passage is already in the database,
    // use it directly. Otherwise, fetch it and cache it in the database. Augment the reading object
    // with the text and version of the passage.
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
                    debug("Fetch from service");
                    return bibleService.fetchPassage(version.code, reading.osisRef).then(content => {
                        return Passage.query().insert({
                            readingId: reading.id,
                            versionId: version.id,
                            content: content
                        }).then(() => content);
                    });
                }
            }).then(content => {
                reading.text = content;
                reading.version = {
                    code: version.code,
                    title: version.title
                };
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
                const version = resolveVersion(request);

                ReadingDay.query()
                    .where('date', request.pre.date)
                    .first()
                    .eager('[readings(bySeq).directions.[practice,steps(bySeq)],directions.[practice,steps(bySeq)]]', {
                        bySeq: qBuilder => qBuilder.orderBy('seq')
                    })
                    .omit(['readingDayId', 'readingId', 'practiceId', 'directionId'])
                    .then(readingDay => {
                        if (!readingDay) {
                            reply(Boom.notFound(`No reading data for '${request.pre.date}'`));
                        } else {
                            // Resolve the passage for each reading.
                            return Promise.all(readingDay.readings
                                .map(reading => resolvePassage(reading, version)))
                                .then(readings => reply(readingDay));
                        }
                    });
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
                        date: Joi.string().isoDate().required().description('Date of reading day'),
                        name: Joi.string().allow('').description('Optional day name (e.g., Easter)')
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
                        .then(readingDay => reply(readingDay));
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
                    .then(readingDays => reply(readingDays));
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
                        date: Joi.string().isoDate().description('Date of reading day'),
                        name: Joi.string().allow('').description('Optional day name (e.g., Easter)')
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
                        .then(readingDay => reply(readingDay));
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
                        .then(result => reply(result));
                }
            }
        }

    ]);

    next();
};

exports.register.attributes = {name: 'readingday', version: '0.0.1'};
