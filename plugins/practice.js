'use strict';

const Boom = require('boom');
const Joi = require('joi');

const Practice = require('../models/Practice');

exports.register = function (server, options, next) {

    server.method('readPractice', function (id, next) {
        Practice.query()
            .findById(id)
            .then(result => next(null, result))
            .catch(err => next(err, null));
    });

    server.route(
        [
            {
                method: 'POST',
                path: '/practices',
                config: {
                    description: 'Create practice',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    validate: {
                        payload: {
                            title: Joi.string().required().description('Practice title'),
                            summary: Joi.string().required().description('Summary of practice'),
                            description: Joi.string().required().description('Practice description')
                        }
                    }
                },
                handler: function (request, reply) {
                    Practice.query()
                        .insert(request.payload)
                        .returning('*')
                        .then(practice => reply(practice))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            },

            {
                method: 'GET',
                path: '/practices',
                config: {
                    description: 'Get all practices',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                },
                handler: function (request, reply) {
                    Practice.query()
                        .then(practices => reply(practices))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            },

            {
                method: 'GET',
                path: '/practices/{id}',
                config: {
                    description: 'Get a single practice',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    pre: [
                        {assign: 'practice', method: 'readPractice(params.id)'}
                    ],
                    validate: {
                        params: {
                            id: Joi.number().integer().min(1).required().description('Practice ID')
                        }
                    }
                },
                handler: function (request, reply) {
                    if (!request.pre.practice) {
                        reply(Boom.notFound(`No practice with ID ${request.params.id}`));
                    } else {
                        reply(request.pre.practice);
                    }
                }
            },

            {
                method: 'PATCH',
                path: '/practices/{id}',
                config: {
                    description: 'Update practice',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    pre: [
                        {assign: 'practice', method: 'readPractice(params.id)'}
                    ],
                    validate: {
                        params: {
                            id: Joi.number().integer().min(1).required().description('Practice ID')
                        },
                        payload: {
                            title: Joi.string().description('Practice title'),
                            summary: Joi.string().description('Summary of practice'),
                            description: Joi.string().description('Practice description')
                        }
                    }
                },
                handler: function (request, reply) {
                    if (!request.pre.practice) {
                        reply(Boom.notFound(`No practice with ID ${request.params.id}`));
                    } else {
                        request.pre.practice.$query()
                            .updateAndFetch(request.payload)
                            .then(practice => reply(practice))
                            .catch(err => reply(Boom.badImplementation(err)));
                    }
                }
            },

            {
                method: 'DELETE',
                path: '/practices/{id}',
                config: {
                    description: 'Delete practice',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    pre: [
                        {assign: 'practice', method: 'readPractice(params.id)'}
                    ],
                    validate: {
                        params: {
                            id: Joi.number().integer().min(1).required().description('Practice ID')
                        }
                    }
                },
                handler: function (request, reply) {
                    if (!request.pre.practice) {
                        reply(Boom.notFound(`No practice with ID ${request.params.id}`));
                    } else {
                        Practice.query()
                            .deleteById(request.params.id)
                            .then(result => reply(result))
                            .catch(err => reply(Boom.badImplementation(err)));
                    }
                }
            }

        ]);

    next();
};

exports.register.attributes = {name: 'practice', version: '0.0.1'};
