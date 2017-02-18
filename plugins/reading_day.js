'use strict';

const Boom = require('boom');
const Joi = require('joi');

const moment = require('moment');
const _ = require('lodash');

const Reading = require('../models/Reading');
const ReadingDay = require('../models/ReadingDay');
const Question = require('../models/Question');

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
    })

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
                    .eager('[readings(orderBySeq).applications(orderBySeq).[practice,steps(orderBySeq).resources],questions(orderBySeq)]', {
                        orderBySeq: qBuilder => qBuilder.orderBy('seq')
                    })
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
            method: 'POST',
            path: '/readingdays',
            config: {
                description: 'Create reading day',
                auth: {
                    strategy: 'jwt',
                    access: { scope: 'admin' }
                },
                validate: {
                    payload: {
                        date: Joi.date().required().description('Date of reading day'),
                        name: Joi.string().description('Optional day name (e.g., Easter)')
                    }
                },
                pre: [
                    {assign:'readingDay', method: 'getReadingDayByDate(payload.date)'}
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
                    access: { scope: 'admin' }
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
                    access: { scope: 'admin' }
                },
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading day ID')
                    }
                },
                pre: [
                    { assign: 'readingDay', method: 'getReadingDayById(params.id)' }
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
                    access: { scope: 'admin' }
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
                    {assign:'readingDay', method: 'getReadingDayById(params.id)'}
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
                    access: { scope: 'admin' }
                },
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading day ID')
                    }
                },
                pre: [
                    { assign: 'readingDay', method: 'getReadingDayById(params.id)' }
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
