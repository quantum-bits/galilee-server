'use strict';

const Boom = require('boom');
const Joi = require('joi');

const Direction = require('../models/Direction');

exports.register = function (server, options, next) {

    const stepSchema = Joi.object({
        seq: Joi.number().integer().required().description('Sequence of step'),
        description: Joi.string().required().description('Description of step'),
    });

    server.method('fetchDirection', function (id, next) {
        Direction.query()
            .findById(id)
            .then(result => next(null, result))
            .catch(err => next(err, null));
    });

    server.route(
        [
            {
                method: 'POST',
                path: '/directions/reading',
                config: {
                    description: 'Create reading direction',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    validate: {
                        payload: {
                            seq: Joi.number().integer().min(1).required().description('Seqence number'),
                            readingId: Joi.number().integer().min(0).required().description('FK to reading'),
                            practiceId: Joi.number().integer().min(0).required().description('FK to practice'),
                            steps: Joi.array().items(stepSchema).min(1).required().description('Steps for direction')
                        }
                    }
                },
                handler: function (request, reply) {
                    Direction.query()
                        .insertGraphAndFetch(request.payload)
                        .eager('[reading,steps,practice]')
                        .omit(['readingId', 'directionId', 'practiceId'])
                        .then(direction => reply(direction))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            },

            {
                method: 'POST',
                path: '/directions/day',
                config: {
                    description: 'Create daily direction',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    validate: {
                        payload: {
                            seq: Joi.number().integer().min(1).required().description('Seqence number'),
                            readingDayId: Joi.number().integer().min(0).required().description('FK to reading day'),
                            practiceId: Joi.number().integer().min(0).required().description('FK to practice'),
                            steps: Joi.array().items(stepSchema).min(1).required().description('Steps for direction')
                        }
                    }
                },
                handler: function (request, reply) {
                    Direction.query()
                        .insertGraphAndFetch(request.payload)
                        .eager('[readingDay,steps,practice]')
                        .omit(['readingDayId', 'directionId', 'practiceId'])
                        .then(direction => reply(direction))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            },

            {
                method: 'GET',
                path: '/directions',
                config: {
                    description: 'Get all directions',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    }
                },
                handler: function (request, reply) {
                    Direction.query()
                        .then(direction => reply(direction))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            },

            {
                method: 'GET',
                path: '/directions/{id}',
                config: {
                    description: 'Get a single direction',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    pre: [
                        {assign: 'direction', method: 'fetchDirection(params.id)'}
                    ],
                    validate: {
                        params: {
                            id: Joi.number().integer().min(1).required().description('Direction ID')
                        }
                    }
                },
                handler: function (request, reply) {
                    if (!request.pre.direction) {
                        reply(Boom.notFound(`No direction with ID ${request.params.id}`));
                    } else {
                        reply(request.pre.direction);
                    }
                }
            },

            // No PATCH endpoint; UI doesn't require it.

            {
                method: 'DELETE',
                path: '/directions/{id}',
                config: {
                    description: 'Delete direction',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    pre: [
                        {assign: 'direction', method: 'fetchDirection(params.id)'}
                    ],
                    validate: {
                        params: {
                            id: Joi.number().integer().min(1).required().description('Direction ID')
                        }
                    }
                },
                handler: function (request, reply) {
                    if (!request.pre.direction) {
                        reply(Boom.notFound(`No direction with ID ${request.params.id}`));
                    } else {
                        Direction.query()
                            .deleteById(request.params.id)
                            .then(result => reply(result))
                            .catch(err => reply(Boom.badImplementation(err)));
                    }
                }
            }

        ]);

    next();
};

exports.register.attributes = {name: 'direction', version: '0.0.1'};
