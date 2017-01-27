'use strict';

const Boom = require('boom');
const Joi = require('Joi');
const _ = require('lodash');

const User = require('../models/User');
const Permission = require('../models/Permission');

/**
 * Filter password field from user objet.
 * @param user
 */
function filterPassword(user) {
    return _.omit(user, ['password'])
}

exports.register = function (server, options, next) {
    /**
     * Does a pertinent user exist?
     * Try searching by email first, then by user ID.
     */
    server.method('userExists', (request, reply) => {
        // Construct WHERE clause.
        let whereClause = null;
        if (request.params.hasOwnProperty('id')) {
            whereClause = {id: request.params.id};
        } else if (request.payload.hasOwnProperty('email')) {
            whereClause = {email: request.payload.email};
        }

        // Run the query.
        if (whereClause) {
            User.query()
                .where(whereClause)
                .first()
                .then(user => {
                    console.log("USER", user);
                    reply(user !== undefined);
                })
                .catch(err => reply(Boom.badImplementation(err)));
        } else {
            reply(Boom.badData("Couldn't build WHERE clause"));
        }
    });

    server.route([
        {
            method: 'GET',
            path: '/users',
            config: {
                description: 'Retrieve all users',
                auth: 'jwt'
            },
            handler: function (request, reply) {
                User.query()
                    .eager('[permissions, version]')
                    .map(user => filterPassword(user))
                    .then(users => reply(users))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/users/{id}',
            config: {
                description: 'Retrieve user with given user ID',
                pre: ['userMatches'],
                auth: 'jwt'
            },
            handler: function (request, reply) {
                if (request.pre.userMatches) {
                    User.query()
                        .where('id', request.params.id)
                        .eager('[permissions, version]')
                        .first()
                        .then(user => {
                            if (user) {
                                reply(filterPassword(user));
                            } else {
                                reply(Boom.notFound(`No user with ID ${request.params.id}`));
                            }
                        })
                        .catch(err => reply(Boom.badImplementation(err)));
                } else {
                    reply(Boom.unauthorized("Can't view other users"));
                }
            }
        },

        // TODO: These PATCH handlers are painfully non-DRY.

        {
            method: 'PATCH',
            path: '/users/{id}/name',
            config: {
                description: 'Update user name',
                pre: ['userExists', 'userMatches'],
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required()
                    },
                    payload: {
                        firstName: Joi.string().required(),
                        lastName: Joi.string().required()
                    }
                },
                auth: 'jwt'
            },
            handler: (request, reply) => {
                if (!request.pre.userExists) {
                    reply(Boom.notFound('No user with that ID'));
                } else if (!request.pre.userMatches) {
                    reply(Boom.unauthorized("Can't update a different user"));
                } else {
                    User.query()
                        .context(request.payload)
                        .patchAndFetchById(request.params.id, request.payload)
                        .then(user => reply(filterPassword(user)))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        },

        {
            method: 'PATCH',
            path: '/users/{id}/email',
            config: {
                description: 'Update user email',
                pre: ['userExists', 'userMatches'],
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required()
                    },
                    payload: {
                        email: Joi.string().email().required()
                    }
                },
                auth: 'jwt'
            },
            handler: (request, reply) => {
                if (!request.pre.userExists) {
                    reply(Boom.notFound(`No user with ID ${request.params.id}`));
                } else if (!request.pre.userMatches) {
                    reply(Boom.unauthorized("Can't update a different user"));
                } else {
                    User.query()
                        .context(request.payload)
                        .patchAndFetchById(request.params.id, request.payload)
                        .then(user => reply(filterPassword(user)))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        },

        {
            method: 'PATCH',
            path: '/users/{id}/password',
            config: {
                description: 'Update user password',
                pre: ['userExists', 'userMatches'],
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required()
                    },
                    payload: {
                        password: Joi.string().min(6).required()
                    }
                },
                auth: 'jwt'
            },
            handler: (request, reply) => {
                if (!request.pre.userExists) {
                    reply(Boom.notFound('No user with that ID'));
                } else if (!request.pre.userMatches) {
                    reply(Boom.unauthorized("Can't update a different user"));
                } else {
                    User.query()
                        .context(request.payload)
                        .patchAndFetchById(request.params.id, request.payload)
                        .then(user => reply(filterPassword(user)))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
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
            path: '/users/signup',
            config: {
                description: 'Sign up a new user',
                pre: ['userExists'],
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
                if (request.pre.userExists) {
                    reply(Boom.conflict('E-mail address already in use.'));
                } else {
                    User.query()
                        .insert({
                            email: request.payload.email,
                            password: request.payload.password,
                            firstName: request.payload.firstName,
                            lastName: request.payload.lastName
                        })
                        .then(user => reply(filterPassword(user)))
                        .catch(err => reply(Boom.badImplementation(err)));
                }
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'user', version: '0.0.1'};
