'use strict';

const Boom = require('boom');
const Joi = require('joi');

const User = require('../models/User');
const Config = require('../models/Config');
const Permission = require('../models/Permission');
const Version = require('../models/Version');

exports.register = function (server, options, next) {

    function isAdminUser(request) {
        return request.auth.credentials.scope.find(scope => scope === 'admin');
    }

    function isAuthorizedForUser(request) {
        return (request.params.id === request.auth.credentials.id || isAdminUser(request));
    }

    server.route([

        {
            method: 'POST',
            path: '/users',
            config: {
                description: 'Sign up a new user',
                pre: [
                    {assign: 'user', method: 'getUserByEmail(payload.email)'}
                ],
                validate: {
                    payload: {
                        email: Joi.string().email().required(),
                        password: Joi.string().min(6).required(),
                        firstName: Joi.string().required(),
                        lastName: Joi.string().required(),
                        preferredVersionId: Joi.number().integer().required()
                    }
                }
            },
            handler: function (request, reply) {
                if (request.pre.user) {
                    reply(Boom.conflict('E-mail address already in use.'));
                } else {
                    Config.getDefaultVersion().then(version =>
                        User.query()
                            .insertAndFetch({
                                email: request.payload.email,
                                password: request.payload.password,
                                firstName: request.payload.firstName,
                                lastName: request.payload.lastName,
                                preferredVersionId: version.id
                            })
                            .omit(['password'])
                            .then(user => reply(user))
                            .catch(err => reply(Boom.badImplementation(err))));
                }
            }
        },

        {
            method: 'GET',
            path: '/users',
            config: {
                description: 'Retrieve data for all users',
                auth: 'jwt'
            },
            handler: function (request, reply) {
                if (!isAdminUser(request)) {
                    return reply(Boom.unauthorized('Insufficient permission'));
                }
                User.query()
                    .eager('[permissions,version,groups.organization]')
                    .omit(['password', 'organizationId'])
                    .then(users => reply(users));
            }
        },

        {
            method: 'GET',
            path: '/users/{id}',
            config: {
                description: 'Retrieve data for a user',
                auth: 'jwt',
                validate: {
                    params: {
                        id: Joi.number().integer().required().description('User ID')
                    }
                }
            },
            handler: function (request, reply) {
                if (!isAuthorizedForUser(request)) {
                    return reply(Boom.unauthorized(`Not authorized for user ${request.params.id}`));
                }
                User.query()
                    .where('id', request.params.id)
                    .eager('[permissions,version,groups.organization]')
                    .omit(['password', 'organizationId'])
                    .first()
                    .then(user => {
                        if (user) {
                            reply(user);
                        } else {
                            reply(Boom.notFound(`No user with ID ${request.params.id}`));
                        }
                    })
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'PATCH',
            path: '/users/name',
            config: {
                description: 'Update user name',
                auth: 'jwt',
                validate: {
                    payload: {
                        firstName: Joi.string().required(),
                        lastName: Joi.string().required()
                    }
                }
            },
            handler: (request, reply) => {
                User.query()
                    .patchAndFetchById(request.auth.credentials.id, request.payload)
                    .omit(['password'])
                    .then(user => reply(user))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'PATCH',
            path: '/users/email',
            config: {
                description: 'Update user email',
                auth: 'jwt',
                pre: [
                    {assign: 'userWithEmail', method: 'getUserByEmail(payload.email)'}
                ],
                validate: {
                    payload: {
                        email: Joi.string().email().required()
                    }
                }
            },
            handler: (request, reply) => {
                if (request.pre.userWithEmail) {
                    reply(Boom.conflict(`E-mail address '${request.payload.email}' already in use.`));
                } else {
                    User.query()
                        .patchAndFetchById(request.auth.credentials.id, request.payload)
                        .omit(['password'])
                        .then(user => reply(user))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        },

        {
            method: 'PATCH',
            path: '/users/password',
            config: {
                description: 'Update user password',
                validate: {
                    payload: {
                        password: Joi.string().min(6).required()
                    }
                },
                auth: 'jwt'
            },
            handler: (request, reply) => {
                User.query()
                    .patchAndFetchById(request.auth.credentials.id, request.payload)
                    .omit(['password'])
                    .then(user => reply(user))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'PATCH',
            path: '/users/version',
            config: {
                description: 'Update preferred version',
                validate: {
                    payload: {
                        preferredVersionId: Joi.number().integer().required()
                    }
                },
                auth: 'jwt'
            },
            handler: (request, reply) => {
                User.query()
                    .patchAndFetchById(request.auth.credentials.id, request.payload)
                    .omit(['password'])
                    .then(user => reply(user))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/users/permissions',
            config: {
                description: 'Fetch all permission types'
                // TODO: Re-enable jwt for this endpoint.
                //auth: 'jwt'
            },
            handler: function (request, reply) {
                Permission.query()
                    .then(results => reply(results))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

    ]);

    next();
};

exports.register.attributes = {name: 'user', version: '0.0.1'};
