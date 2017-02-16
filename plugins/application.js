'use strict';

const Boom = require('boom');
const Joi = require('joi');

const Application = require('../models/Application');

exports.register = function (server, options, next) {

    const stepSchema = Joi.object({
        seq: Joi.number().integer().required().description('Sequence of step'),
        description: Joi.string().required().description('Description of step'),
    });

    server.method('readApplication', function (id, next) {
        Application.query()
            .findById(id)
            .eager('[steps,reading,practice]')
            .then(result => next(null, result))
            .catch(err => next(err, null));
    });

    server.route(
        [
            {
                method: 'POST',
                path: '/applications',
                config: {
                    description: 'Create application',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    validate: {
                        payload: {
                            seq: Joi.number().integer().min(1).required().description('Seqence number'),
                            readingId: Joi.number().integer().min(0).required().description('FK to reading'),
                            practiceId: Joi.number().integer().min(0).required().description('FK to practice'),
                            steps: Joi.array().items(stepSchema).min(1).required().description('Steps for application')
                        }
                    }
                },
                handler: function (request, reply) {
                    Application.query()
                        .insertGraphAndFetch(request.payload)
                        .eager('[reading,practice,steps]')
                        .omit(['readingId', 'practiceId'])
                        .then(application => reply(application))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            },

            {
                method: 'GET',
                path: '/applications',
                config: {
                    description: 'Get all applications',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                },
                handler: function (request, reply) {
                    Application.query()
                        .eager('[reading,practice,steps]')
                        .omit(['readingId', 'practiceId'])
                        .then(applications => reply(applications))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            },

            {
                method: 'GET',
                path: '/applications/{id}',
                config: {
                    description: 'Get a single application',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    pre: [
                        {assign: 'application', method: 'readApplication(params.id)'}
                    ],
                    validate: {
                        params: {
                            id: Joi.number().integer().min(1).required().description('Application ID')
                        }
                    }
                },
                handler: function (request, reply) {
                    if (!request.pre.application) {
                        reply(Boom.notFound(`No application with ID ${request.params.id}`));
                    } else {
                        reply(request.pre.application);
                    }
                }
            },

            // No PATCH endpoint; UI doesn't require it.

            {
                method: 'DELETE',
                path: '/applications/{id}',
                config: {
                    description: 'Delete application',
                    auth: {
                        strategy: 'jwt',
                        access: {scope: 'admin'}
                    },
                    pre: [
                        {assign: 'application', method: 'readApplication(params.id)'}
                    ],
                    validate: {
                        params: {
                            id: Joi.number().integer().min(1).required().description('Application ID')
                        }
                    }
                },
                handler: function (request, reply) {
                    if (!request.pre.application) {
                        reply(Boom.notFound(`No application with ID ${request.params.id}`));
                    } else {
                        Application.query()
                            .deleteById(request.params.id)
                            .then(result => reply(result))
                            .catch(err => reply(Boom.badImplementation(err)));
                    }
                }
            }

        ]);

    next();
};

exports.register.attributes = {name: 'application', version: '0.0.1'};
