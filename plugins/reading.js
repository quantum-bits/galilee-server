'use strict';

const Boom = require('boom');
const Joi = require('joi');

const moment = require('moment');
const _ = require('lodash');

const Reading = require('../models/Reading');
const ReadingDay = require('../models/ReadingDay');

exports.register = function (server, options, next) {

    // Map array [ { date: 'YYYY-MM-DD', count: n }, ... ] to object { 'YYYY-MM-DD': n, ... }
    function arrayOfObjToObj(arr) {
        return _.reduce(arr, (obj, val) => {
            obj[val.date] = +val.count;
            return obj
        }, {})
    }

    function dateRange() {
        // Moments are mutable; clone one so we are certain that we start from the
        // same date, even if we cross midnight between endpoints.
        let now1 = moment();
        let now2 = now1.clone();
        return {
            from: now1.startOf('week').subtract(2, 'weeks').format('YYYY-MM-DD'),
            to: now2.endOf('week').add(2, 'weeks').format('YYYY-MM-DD')
        }
    }

    // Get the number of readings for each reading day.
    server.method('getReadingStats', function (scope, next) {
        let isAdmin = false; 
        if(scope !== undefined){
           isAdmin = scope.find(elt => elt == 'admin'); 
        }
        let query = ReadingDay.query()
            .select('readingDay.date')
            .count('reading.id')
            .leftOuterJoin('reading', 'reading.readingDayId', 'readingDay.id')
            .groupBy('readingDay.id')
            .orderBy('readingDay.date');

        if (!isAdmin) {
            // Ordinary user; limit date range.
            let range = dateRange();
            query
                .where('readingDay.date', '>=', range.from)
                .where('readingDay.date', '<=', range.to);
        }

        query
            .then(result => next(null, arrayOfObjToObj(result)))
            .catch(err => next(err, null));
    });

    server.method('getReading', function (id, next) {
        Reading.query()
            .findById(id)
            .eager('passages.version')
            .then(reading => next(null, reading))
            .catch(err => next(err, null));
    });

    server.route([

        {
            method: 'POST',
            path: '/readings',
            config: {
                description: 'New rading',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                validate: {
                    payload: {
                        readingDayId: Joi.number().integer().min(1).required().description('ID of reading day'),
                        seq: Joi.number().integer().min(1).required().description('Sequence number within day'),
                        stdRef: Joi.string().required().description('Standard passage reference'),
                        osisRef: Joi.string().required().description('OSIS reference')
                    }
                }
            },
            handler: function (request, reply) {
                Reading.query()
                    .insert(request.payload)
                    .returning('*')
                    .then(reading => reply(reading))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/readings/meta',
            config: {
                description: 'Readings metadata',
                auth:{
                    strategy: 'jwt',
                    mode: 'try'
                },
                pre: [
                    {assign: 'readingStats', method: 'getReadingStats(auth.credentials.scope)'}
                ]
            },
            handler: function (request, reply) {
                reply(request.pre.readingStats);
            }
        },

        {
            method: 'GET',
            path: '/readings',
            config: {
                description: 'Get all readings',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                }
            },
            handler: function (request, reply) {
                Reading.query()
                    .eager('passages.version')
                    .then(readings => reply(readings))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/readings/{id}',
            config: {
                description: 'Get a single reading',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading ID')
                    }
                },
                pre: [
                    {assign: 'reading', method: 'getReading(params.id)'}
                ]
            },
            handler: function (request, reply) {
                if (!request.pre.reading) {
                    reply(Boom.notFound(`Reading ${request.params.id} not found`));
                } else {
                    reply(request.pre.reading);
                }
            }
        },

        {
            method: 'PATCH',
            path: '/readings/{id}',
            config: {
                description: 'Update reading',
                auth: {
                    strategy: 'jwt',
                    access: {scope: 'admin'}
                },
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading day ID')
                    },
                    payload: {
                        seq: Joi.number().integer().min(1).description('Sequence number within day'),
                        stdRef: Joi.string().description('Standard passage reference'),
                        osisRef: Joi.string().description('OSIS reference')
                    }
                },
                pre: [
                    {assign: 'reading', method: 'getReading(params.id)'}
                ]
            },
            handler: function (request, reply) {
                if (!request.pre.reading) {
                    reply(Boom.notFound(`No reading with ID ${request.params.id}`));
                } else {
                    request.pre.reading.$query()
                        .updateAndFetch(request.payload)
                        .then(reading => reply(reading))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        },

        {
            method: 'DELETE',
            path: '/readings/{id}',
            config: {
                description: 'Delete a reading',
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
                    {assign: 'reading', method: 'getReading(params.id)'}
                ]
            },
            handler: function (request, reply) {
                if (!request.pre.reading) {
                    reply(Boom.notFound(`No reading with ID ${request.params.id}`));
                } else {
                    Reading.query()
                        .deleteById(request.params.id)
                        .then(result => reply(result))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        }

    ]);

    next();
};

exports.register.attributes = {name: 'reading', version: '0.0.1'};
