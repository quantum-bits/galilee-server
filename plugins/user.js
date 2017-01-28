'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const User = require('../models/User');
const Config = require('../models/Config');
const Version = require('../models/Version');

exports.register = function (server, options, next) {

    server.route([
        {
            method: 'GET',
            path: '/users',
            config: {
                description: 'Retrieve data for current user',
                auth: 'jwt'
            },
            handler: function (request, reply) {
                User.query()
                    .where('id', request.auth.credentials.id)
                    .eager('[permissions, version]')
                    .omit(['password'])
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
                    .context(request.payload)
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
            },
            handler: function (request, reply) {
                Permission.query()
                    .then(results => reply(results))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

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
                        lastName: Joi.string().required()
                    }
                }
            },
            handler: function (request, reply) {
                if (request.pre.user) {
                    reply(Boom.conflict('E-mail address already in use.'));
                } else {
                    Config.query()
                        .findById('default-version')
                        .then(config => {
                            Version.query()
                                .where('code', config.value)
                                .first()
                                .then(version => {
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
                                        .catch(err => reply(Boom.badImplementation(err)));
                                })
                        })
                }
            }
        }
    ]);

    next();
}
;

exports.register.attributes = {name: 'user', version: '0.0.1'};
