'use strict';

const Boom = require('boom');
const Joi = require('joi');

const moment = require('moment');
const _ = require('lodash');

const Reading = require('../models/Reading');

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
                    access: { scope: 'admin' }
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
            path: '/readings',
            config: {
                description: 'Get all readings',
                auth: {
                    strategy: 'jwt',
                    access: { scope: 'admin' }
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
                    access: { scope: 'admin' }
                },
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('Reading ID')
                    }
                },
                pre: [
                    {assign:'reading', method:'getReading(params.id)'}
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
            handler: function(request, reply) {
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
                    access: { scope: 'admin' }
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
