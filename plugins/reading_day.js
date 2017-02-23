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

    function getVersion(versionCode, user) {
        new Promise((resolve, reject) => {
            if (code) {
                Version.query().where('code', code).first();
            } else if (user) {
                Version.query().findById(user.preferredVersionId)
            }

        })
    }

    // Return a promise that resolves to the full Version record for the
    // version 'code'. If 'code' is falsy, retrieve the default version
    // from the Config object.
    server.method('getVersion', function (code, next) {
        new Promise((resolve, reject) => {
            if (code) {
                resolve(code);
            } else {
                Config.getDefaultVersion().then(config => resolve(config.value));
            }
        }).then(code => {
            return Version.query().where('code', code).first();
        }).then(version => next(null, version))
            .catch(err => next(err, null));
    });

    // Get the passage for a reading from the given version. If the passage is already in the database,
    // return it directly. Otherwise, fetch it from BG and cache it in the database for a future
    // fetch. In either case, return just the content.
    function getPassageContent(reading, version) {
        return Reading.query()
            .findById(reading.id)
            .eager('passages.version')
            .then(reading => {
                let passage = reading.passages.find(passage => {
                    return passage.version.id === version.id;
                });

                if (passage) {
                    debug("ALREADY HAVE %o", version.code);
                    return passage.content;
                }

                // Don't have this version of the passage; go fetch it.
                debug("FETCH PASSAGE %o FOR %o", reading.osisRef, version.code);
                return server.plugins.bible_gateway.getPassage(version.code, reading.osisRef)
                    .then(passage => {
                        // Cache the passage in the database.
                        const content = passage.passages[0].content;
                        return Passage.query().insert({
                            readingId: reading.id,
                            versionId: version.id,
                            content: content
                        }).then(() => {
                            debug("SAVED PASSAGE");
                            return content;
                        });
                    });
            }).catch(err => new Error(err));
    }

    server.route([
        {
            method: 'GET',
            path: '/daily/{date}/{version?}',
            config: {
                description: "Get readings for given date (or 'today')",
                auth: {
                    strategy: 'jwt',
                    mode: 'optional'    // If credentials present, must be valid.
                },
                pre: [
                    {assign: 'date', method: 'normalizeDate(params.date)'},
                    {assign: 'version', method: 'getVersion(params.version)'}
                ]
            },
            handler: function (request, reply) {
                // console.log("DATE", request.pre.date);
                // console.log("VERSION", request.pre.version);
                ReadingDay.query()
                    .where('date', request.pre.date)
                    .first()
                    .eager('[readings(orderBySeq).applications(orderBySeq).[practice,steps(orderBySeq).resources],questions(orderBySeq)]', {
                        orderBySeq: qBuilder => qBuilder.orderBy('seq')
                    })
                    .omit(['readingDayId', 'readingId', 'practiceId'])
                    .then(readingDay => {
                        if (!readingDay) {
                            reply(Boom.notFound(`No reading data for '${request.pre.date}'`));
                        } else {
                            // Fetch all passages, either from DB or BG.
                            Promise.all(readingDay.readings.map(reading =>
                                getPassageContent(reading, request.pre.version).then(content => {
                                    reading.text = content;
                                    return reading;
                                }))).then(readings => {
                                reply(readingDay);
                            })
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
