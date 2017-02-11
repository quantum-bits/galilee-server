'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const moment = require('moment');
const _ = require('lodash');

const Reading = require('../models/Reading');
const ReadingDay = require('../models/ReadingDay');
const Question = require('../models/Question');

exports.register = function (server, options, next) {

    // Get statistics on all the user's journal entries.
    server.method('getReadingStats', function (next) {
        Reading.query()
            .join('readingDay', 'readingDayId', 'readingDay.id')
            .select('readingDay.date')
            .map(result => moment(result.date).format('YYYY-MM-DD'))
            .then(dates => next(null, _.countBy(dates)))
            .catch(err => next(err, null));
    });

    server.method('getReading', function (readingId, next) {
        Reading.query()
            .findById(readingId)
            .then(reading => next(null, reading))
            .catch(err => next(err, null));
    });

    server.method('getReadingDay', function (readingDayId, next) {
        ReadingDay.query()
            .findById(readingDayId)
            .then(readingDay => next(null, readingDay))
            .catch(err => next(err, null));
    });

    server.route([
        {
            method: 'GET',
            path: '/daily/{date}',
            config: {
                description: "Get readings for given date (or 'today')",
                pre: ['normalizeDate(params.date)']
            },
            handler: function (request, reply) {
                ReadingDay.query()
                    .where('date', request.pre.normalizeDate)
                    .first()
                    .eager('[readings.applications.[practice,steps.resources],questions]')
                    .omit(['readingDayId', 'readingId', 'practiceId'])
                    .then(readingDay => {
                        if (!readingDay) {
                            reply(Boom.notFound(`No reading data for '${request.pre.normalizeDate}'`));
                        } else {
                            // Fetch scripture text from Bible Gateway.
                            let promises = [];
                            readingDay.readings.map(reading => {
                                let p = new Promise((resolve, reject) => {
                                    server.methods.getPassage('NKJV', reading.osisRef, (err, result) => {
                                        if (err) {
                                            reading.text = `Bible Gateway error '${err}'`;
                                        } else {
                                            reading.text = result.data[0].passages[0].content;
                                        }
                                        return resolve(result);
                                    })
                                });
                                promises.push(p);
                            });

                            // Wait for Bible Gateway to complete and respond to client.
                            Promise.all(promises).then(res => {
                                reply(readingDay);
                            });
                        }
                    })
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/readings/meta',
            config: {
                description: 'Readings metadata',
                auth: 'jwt',
                pre: [
                    {assign: 'readingStats', method: 'getReadingStats()'}
                ]
            },
            handler: function (request, reply) {
                reply(request.pre.readingStats);
            }
        },

        {
            method: 'GET',
            path: '/readings/{id}',
            config: {
                description: 'Get a single reading',
                auth: 'jwt',
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading ID')
                    }
                }
            },
            handler: function (request, reply) {
                Reading.query()
                    .where('id', request.params.id)
                    .first()
                    .then(reading => {
                        if (reading) {
                            reply(reading);
                        } else {
                            reply(Boom.notFound(`Reading ${request.params.id} not found`));
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
                auth: 'jwt',
                validate: {
                    payload: {
                        date: Joi.date().required().description('Date of reading day'),
                        name: Joi.string().description('Optional day name (e.g., Easter)')
                    }
                }
            },
            handler: function (request, reply) {
                ReadingDay.query()
                    .insert({
                        date: request.payload.date,
                        name: request.payload.name || ''
                    })
                    .returning('*')
                    .then(readingDay => reply(readingDay))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/readingdays',
            config: {
                description: 'Get all reading days',
                auth: 'jwt',
            },
            handler: function (request, reply) {
                ReadingDay.query()
                    .then(readingDays => reply(readingDays))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'DELETE',
            path: '/readingdays/{id}',
            config: {
                description: 'Get a single reading day',
                auth: 'jwt',
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading day ID')
                    }
                },
                pre: [
                    { assign: 'readingDay', method: 'getReadingDay(params.id)' }
                ]
            },
            handler: function (request, reply) {
                if (request.pre.readingDay) {
                    ReadingDay.query()
                        .deleteById(request.params.id)
                        .then(result => reply(result))
                        .catch(err => reply(Boom.badImplementation(err)));
                } else {
                    reply(Boom.notFound(`No readingDay with ID ${request.params.id}`));
                }
            }
        }

    ]);

    next();
};

exports.register.attributes = {name: 'reading', version: '0.0.1'};
