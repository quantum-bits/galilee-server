'use strict';

const Boom = require('boom');
const Joi = require('joi');

const User = require('../models/User');
const Config = require('../models/Config');
const Permission = require('../models/Permission');
const Version = require('../models/Version');

exports.register = function (server, options, next) {

    // Is the request from a user with administrative permissions?
    function isAdminUser(request) {
        return request.auth.credentials.scope.find(scope => scope === 'admin');
    }

    // Is the request from a user who is authoried to see the given user's data?
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
                    User.query()
                        .insertAndFetch({
                            email: request.payload.email,
                            password: request.payload.password,
                            firstName: request.payload.firstName,
                            lastName: request.payload.lastName,
                            preferredVersionId: request.payload.preferredVersionId
                        })
                        .omit(['password'])
                        .then(user => reply(user))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        },

        {
            method: 'GET',
            path: '/users/permissions',
            config: {
                description: 'Fetch all permission types',
                auth: 'jwt'
            },
            handler: function (request, reply) {
                Permission.query()
                    .then(results => reply(results))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/users',
            config: {
                description: 'Retrieve data for all users (admin only)',
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
            path: '/users/{id}',
            config: {
                description: 'Update user data',
                auth: 'jwt',
                validate: {
                    payload: {
                        // None of these is required, but if present must validate.
                        firstName: Joi.string(),
                        lastName: Joi.string(),
                        email: Joi.string().email(),
                        password: Joi.string().min(6),
                        preferredVersionId: Joi.number().integer()
                    }
                }
            },
            handler: (request, reply) => {
                if (!isAuthorizedForUser(request)) {
                    return reply(Boom.unauthorized(`Not authorized for user ${request.params.id}`));
                }
                if (request.payload.email !== null) {
                    server.methods.getUserByEmail(request.payload.email, (err, user) => {
                        if (err) {
                            return reply(Boom.notFound('Email check failed'));
                        }
                        if (user) {
                            reply(Boom.conflict(`E-mail address '${request.payload.email}' already in use.`));
                        }
                    });
                }
                User.query()
                    .patchAndFetchById(request.params.id, request.payload)
                    .omit(['password'])
                    .then(user => reply(user))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        }

    ]);

    next();
};

exports.register.attributes = {name: 'user', version: '0.0.1'};
