'use strict';

const Boom = require('boom');
const Joi = require('joi');

const ReadingDayGuidance = require('../models/ReadingDayGuidance');
const ReadingGuidance = require('../models/ReadingGuidance');

exports.register = function (server, options, next) {

    const stepSchema = Joi.object({
        seq: Joi.number().integer().required().description('Sequence of step'),
        description: Joi.string().required().description('Description of step'),
    });

    const guidancePayloadSchema = Joi.object({
        practiceId: Joi.number().integer().min(0).required().description('FK to practice'),
        steps: Joi.array().items(stepSchema).min(1).required().description('Steps for guidance')
    });

    const typeSchema = Joi.string().valid('reading', 'day');

    const guidanceParamSchema = Joi.object({
        type: typeSchema,
        id: Joi.number().integer().min(1).required().description('Guidance ID')
    });

    server.method('fetchGuidance', function (type, id, next) {
        let query = null;

        if (type === 'reading') {
            query = ReadingGuidance.query()
                .findById(id)
                .eager('[reading,guidance.[steps,practice]]');
        } else if (type === 'day') {
            query = ReadingDayGuidance.query()
                .findById(id)
                .eager('[readingDay,guidance.[steps,practice]]');
        }

        query
            .then(result => next(null, result))
            .catch(err => next(err, null));
    });

    server.route(
        [
            {
                method: 'POST',
                path: '/guidance/reading',
                config: {
                    description: 'Create reading guidance',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    validate: {
                        payload: {
                            seq: Joi.number().integer().min(1).required().description('Seqence number'),
                            readingId: Joi.number().integer().min(0).required().description('FK to reading'),
                            guidance: guidancePayloadSchema,
                        }
                    }
                },
                handler: function (request, reply) {
                    ReadingGuidance.query()
                        .insertGraphAndFetch(request.payload)
                        .eager('[reading,guidance.[steps,practice]]')
                        .omit(['readingId', 'guidanceId', 'practiceId'])
                        .then(guidance => reply(guidance))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            },

            {
                method: 'POST',
                path: '/guidance/day',
                config: {
                    description: 'Create daily guidance',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    validate: {
                        payload: {
                            seq: Joi.number().integer().min(1).required().description('Seqence number'),
                            readingDayId: Joi.number().integer().min(0).required().description('FK to reading day'),
                            guidance: guidancePayloadSchema,
                        }
                    }
                },
                handler: function (request, reply) {
                    ReadingDayGuidance.query()
                        .insertGraphAndFetch(request.payload)
                        .eager('[readingDay,guidance.[steps,practice]]')
                        .omit(['readingDayId', 'guidanceId', 'practiceId'])
                        .then(guidance => reply(guidance))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            },

            {
                method: 'GET',
                path: '/guidance/{type}',
                config: {
                    description: 'Get all guidance of given type',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    validate: {
                        params: {
                            type: typeSchema
                        }
                    }
                },
                handler: function (request, reply) {
                    let query = null;
                    if (request.params.type === 'reading') {
                        query = ReadingGuidance.query()
                            .eager('[reading,guidance.[steps,practice]]');
                    } else if (request.params.type === 'day') {
                        query = ReadingDayGuidance.query()
                            .eager('[readingDay,guidance.[steps,practice]]');
                    }
                    query
                        .then(guidance => reply(guidance))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            },

            {
                method: 'GET',
                path: '/guidance/{type}/{id}',
                config: {
                    description: 'Get single guidance',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    pre: [
                        {assign: 'guidance', method: 'fetchGuidance(params.type, params.id)'}
                    ],
                    validate: {
                        params: guidanceParamSchema
                    }
                },
                handler: function (request, reply) {
                    if (!request.pre.guidance) {
                        reply(Boom.notFound(`No ${request.params.type} guidance with ID ${request.params.id}`));
                    } else {
                        reply(request.pre.guidance);
                    }
                }
            },

            // No PATCH endpoint; UI doesn't require it.

            {
                method: 'DELETE',
                path: '/guidance/{type}/{id}',
                config: {
                    description: 'Delete guidance',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    pre: [
                        {assign: 'guidance', method: 'fetchGuidance(params.type, params.id)'}
                    ],
                    validate: {
                        params: guidanceParamSchema
                    }
                },
                handler: function (request, reply) {
                    if (!request.pre.guidance) {
                        reply(Boom.notFound(`No ${request.params.type} guidance with ID ${request.params.id}`));
                    } else {
                        let queryClass = null;
                        if (request.params.type === 'reading') {
                            queryClass = ReadingGuidance;
                        } else if (request.params.type === 'day') {
                            queryClass = ReadingDayGuidance;
                        }
                        queryClass.query()
                            .deleteById(request.params.id)
                            .then(result => reply(result))
                            .catch(err => reply(Boom.badImplementation(err)));
                    }
                }
            }

        ]);

    next();
};

exports.register.attributes = {name: 'guidance', version: '0.0.1'};
